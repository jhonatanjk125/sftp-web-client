import os
import posixpath
from zipstream import ZipFile as ZipStream, ZIP_DEFLATED
from typing import List, Generator
from fastapi import FastAPI, Depends, HTTPException, Query, File, UploadFile, Body, Response, Cookie
from paramiko import SSHClient, AutoAddPolicy, SFTPClient, Transport, SFTPError
from dotenv import load_dotenv
from pydantic import BaseModel
from datetime import datetime, timedelta
from stat import S_ISDIR
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import secrets
import redis


load_dotenv()

app = FastAPI(title="SFTP Web Client API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],                      
    allow_headers=["*"],                      
)

UPSTASH_HOST = os.getenv("UPSTASH_REDIS_URL")
UPSTASH_PORT = os.getenv("UPSTASH_REDIS_PORT", 6379)
UPSTASH_TOKEN = os.getenv("UPSTASH_REDIS_TOKEN")

if not UPSTASH_HOST or not UPSTASH_TOKEN:
    raise RuntimeError("Missing UPSTASH_REDIS_URL or UPSTASH_REDIS_TOKEN env vars")

r = redis.Redis(
  host=UPSTASH_HOST,
  port=UPSTASH_PORT,
  password=UPSTASH_TOKEN,
  ssl=True,
  decode_responses=True
)



def get_sftp_client(
    response: Response,
    session_token: str = Cookie(None)           
):
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    data = r.hgetall(f"session:{session_token}")
    if not data:
        raise HTTPException(status_code=401, detail="Session expired")


    r.expire(f"session:{session_token}", timedelta(hours=1))


    response.set_cookie(
        key="session_token",
        value=session_token,
        max_age=3600,     
        httponly=True,      
        secure=True,        
        samesite="strict"
    )

    creds = SFTPCredentials(**data)
    return connect_sftp(creds)

def stream_sftp_file(
    path: str,
    sftp: SFTPClient,
    chunk_size: int = 16_384

) -> Generator[bytes, None, None]:
    """
    Generator that:
      1. Uses the already-authenticated SFTPClient
      2. Opens the remote file
      3. Yields it in chunks
      4. Relies on FastAPI to close the SFTPClient when the request ends
    """
    try:
        attrs = sftp.stat(path)
        if S_ISDIR(attrs.st_mode):
            raise HTTPException(400, detail=f"{path} is a directory, not a file")

        with sftp.open(path, "rb") as remote:
            while True:
                chunk = remote.read(chunk_size)
                if not chunk:
                    break
                yield chunk

    except FileNotFoundError:
        raise HTTPException(404, detail=f"File not found: {path}")


def walk_sftp(sftp: SFTPClient, path: str):
    """
    Generator that mirrors os.walk for an SFTP server.
    Yields (current_path, [subdirs], [files]).
    """
    dirs, files = [], []
    for name in sftp.listdir(path):
        attr = sftp.stat(f"{path.rstrip('/')}/{name}")
        if S_ISDIR(attr.st_mode):
            dirs.append(name)
        else:
            files.append(name)
    yield path, dirs, files
    for d in dirs:
        yield from walk_sftp(sftp, f"{path.rstrip('/')}/{d}")


def stream_directory_as_zip(
    root: str,
    sftp: SFTPClient,
    chunk_size: int = 16_384
) -> Generator[bytes, None, None]:
    """
    Lazily walks the remote SFTP tree under `root`, and streams back
    a ZIP archive, chunk by chunk, without buffering the whole ZIP.
    """
    z = ZipStream(mode="w", compression=ZIP_DEFLATED)

    def walk(path: str):
        dirs, files = [], []
        for name in sftp.listdir(path):
            full = f"{path.rstrip('/')}/{name}"
            if S_ISDIR(sftp.stat(full).st_mode):
                dirs.append(name)
            else:
                files.append(name)
        yield path, dirs, files
        for d in dirs:
            yield from walk(f"{path.rstrip('/')}/{d}")

    for dirpath, dirnames, filenames in walk(root):
        rel = os.path.relpath(dirpath, root).lstrip("./\\") or ""
        for fname in filenames:
            remote_path = f"{dirpath.rstrip('/')}/{fname}"
            arcname     = f"{rel}/{fname}" if rel else fname

            # generator to stream each file’s bytes
            def file_iter(fp=remote_path):
                with sftp.open(fp, "rb") as rf:
                    while True:
                        chunk = rf.read(chunk_size)
                        if not chunk:
                            break
                        yield chunk

            z.write_iter(arcname, file_iter())

    for chunk in z:
        yield chunk

# Models
class FileInfo(BaseModel):
    name: str
    size: int
    modified: datetime
    is_dir: bool


class SFTPCredentials(BaseModel):
    host: str
    port: int = 22
    username: str
    password: str

# Utility functions
def connect_sftp(creds: SFTPCredentials) -> SFTPClient:
    ssh = SSHClient()
    ssh.set_missing_host_key_policy(AutoAddPolicy())
    ssh.connect(
        hostname=creds.host,
        port=creds.port,
        username=creds.username,
        password=creds.password
    )
    return ssh.open_sftp()

# Routes
@app.post("/auth/login")
def login(credentials: SFTPCredentials, response: Response):
    try:
        client = connect_sftp(credentials)
        client.close()
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Connection failed: {e!s}")

    token = secrets.token_urlsafe(32)


    r.hset(f"session:{token}", mapping=credentials.dict())
    r.expire(f"session:{token}", timedelta(hours=1))

    response.set_cookie(
        key="session_token",
        value=token,
        max_age=3600,
        httponly=True,
        secure=True,
        samesite="strict",
    )
    return {"message": "Logged in"}


@app.post("/auth/logout", summary="Log out and clear SFTP session")
def logout(
    response: Response,
    session_token: str = Cookie(None)
):
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    r.delete(f"session:{session_token}")

    response.delete_cookie(
        key="session_token",
        httponly=True,
        secure=True,    # Set to True in production
        samesite="strict"
    )

    return {"message": "Logged out"}


@app.get("/files/", summary="List contents of an SFTP directory")
def list_remote_dir(
    path: str = Query(".", description="Remote directory path"),
    sftp: SFTPClient = Depends(get_sftp_client)
) -> List[str]:
    """
    Returns a list of file and folder names in the given remote path.
    """
    try:
        return sftp.listdir(path)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Directory not found: {path}")
    except PermissionError:
        raise HTTPException(status_code=403, detail="Permission denied")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    


@app.get("/files/meta/", 
         response_model=List[FileInfo], 
         summary="List files and directories with metadata",
         description="Returns name, size, modification time, and type (file or directory) for each entry in the given path.")
def list_with_meta(
    path: str = Query(".", description="Remote directory path"),
    sftp: SFTPClient = Depends(get_sftp_client)
) -> List[FileInfo]:
    try:
        entries: List[FileInfo] = []
        for name in sftp.listdir(path):             
            full_path = f"{path.rstrip('/')}/{name}"
            attrs = sftp.stat(full_path)            
            entries.append(FileInfo(
                name=name,
                size=attrs.st_size,
                modified=datetime.fromtimestamp(attrs.st_mtime),
                is_dir=S_ISDIR(attrs.st_mode)
            ))
        return entries

    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Not found: {path}")
    except PermissionError:
        raise HTTPException(status_code=403, detail="Permission denied")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    


@app.get("/files/download/", summary="Download a file or directory")
def download(
    path: str = Query(..., description="Remote file or directory path"),
    sftp: SFTPClient = Depends(get_sftp_client),
):
    try:
        attrs = sftp.stat(path)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Not found: {path}")
    except PermissionError:
        raise HTTPException(status_code=403, detail="Permission denied")
    

    if S_ISDIR(attrs.st_mode):
        archive_name = os.path.basename(path.rstrip("/")) or "root"
        return StreamingResponse(
            stream_directory_as_zip(path, sftp=sftp),               
            media_type="application/zip",
            headers={
                "Content-Disposition": 
                  f'attachment; filename="{archive_name}.zip"'
            }
        )

    return StreamingResponse(
        stream_sftp_file(path, sftp=sftp),                         
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": 
              f'attachment; filename="{os.path.basename(path)}"'
        }
    )

@app.post(
    "/files/upload/",
    summary="Upload files to a remote directory",
    description="Uploads one or more files to the specified remote SFTP directory."
)
def upload_files(
    dest_dir: str = Query(
        ..., 
        description="Remote directory in which to place uploaded files"
    ),
    uploads: List[UploadFile] = File(
        ..., 
        description="One or more files to upload"
    ),
    sftp: SFTPClient = Depends(get_sftp_client)
):
    """
    For each incoming file:
      1. Ensure the remote destination directory exists.
      2. Stream the file content via sftp.putfo() without buffering the entire file.
    Returns the list of filenames successfully uploaded.
    """
    # 1) Ensure dest_dir exists
    try:
        sftp.stat(dest_dir)
    except FileNotFoundError:
        parts = dest_dir.rstrip("/").split("/")
        path_acc = ""
        for part in parts:
            path_acc = f"{path_acc}/{part}".lstrip("/")
            try:
                sftp.mkdir(path_acc)
            except OSError:
                pass  

    uploaded = []
    for upload in uploads:
        filename = os.path.basename(upload.filename)
        remote_path = f"{dest_dir.rstrip('/')}/{filename}"

        try:
            sftp.stat(remote_path)
            raise HTTPException(
                status_code=409,
                detail=f"File already exists: {remote_path}"
            )
        except FileNotFoundError:
            pass

        try:
            sftp.putfo(upload.file, remote_path)
            uploaded.append(filename)
        except PermissionError:
            raise HTTPException(
                status_code=403,
                detail=f"Permission denied writing {remote_path}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to upload {filename}: {e}"
            )

    return {"uploaded": uploaded}



@app.post("/files/mkdir/", summary="Create a new directory")
def make_dir(
    path: str = Body(..., embed=True),
    sftp: SFTPClient = Depends(get_sftp_client),
):
    try:
        sftp.mkdir(path)
    except OSError as e:
        raise HTTPException(400, str(e))
    return {"created": path}


@app.delete(
    "/files/delete/",
    summary="Delete one or more files or directories (recursively)",
    description="Deletes one or more files or directories on the SFTP server. Directories are deleted recursively."
)
def delete_paths(
    paths: List[str] = Body(..., example=["/remote/file1.txt", "/remote/folder1"]),
    sftp: SFTPClient = Depends(get_sftp_client)
):
    """
    Accepts a list of remote paths (files or directories). Recursively deletes each.
    Returns a report of successfully deleted and failed paths.
    """

    def recursive_delete(path: str):
        try:
            attr = sftp.stat(path)
        except FileNotFoundError:
            raise FileNotFoundError(f"Path not found: {path}")

        if S_ISDIR(attr.st_mode):
            for entry in sftp.listdir_attr(path):
                entry_path = f"{path.rstrip('/')}/{entry.filename}"
                if S_ISDIR(entry.st_mode):
                    recursive_delete(entry_path)
                else:
                    sftp.remove(entry_path)
            sftp.rmdir(path)
        else:
            sftp.remove(path)

    deleted = []
    failed = []

    for path in paths:
        try:
            recursive_delete(path)
            deleted.append(path)
        except Exception as e:
            failed.append({"path": path, "error": str(e)})

    return {
        "deleted": deleted,
        "failed": failed
    }



@app.patch("/files/rename/", summary="Rename or move a file or directory")
def rename_path(
    old_path: str = Body(..., embed=True),
    new_path: str = Body(..., embed=True),
    sftp: SFTPClient = Depends(get_sftp_client),
):
    try:
        sftp.rename(old_path, new_path)
    except FileNotFoundError:
        raise HTTPException(404, f"Not found: {old_path}")
    except PermissionError:
        raise HTTPException(403, f"Permission denied")
    return {"renamed": old_path, "to": new_path}


# ─────────────────────────────────────────────────────────────
# mount existing `app` under the /api prefix
# ─────────────────────────────────────────────────────────────
root = FastAPI()
root.mount("/api", app)
app = root