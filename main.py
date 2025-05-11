import os
from zipstream import ZipFile as ZipStream, ZIP_DEFLATED
from typing import List
from colorama import Back
from fastapi import FastAPI, Depends, HTTPException, Query
from paramiko import SSHClient, AutoAddPolicy, SFTPClient
from dotenv import load_dotenv
from pydantic import BaseModel
from datetime import datetime
from stat import S_ISDIR
from fastapi.responses import StreamingResponse


load_dotenv()

app = FastAPI(title="SFTP Web Client API")


# Dependencies
def get_sftp_client() -> SFTPClient:
    """
    Dependency that yields a connected SFTPClient,
    then closes it when the request is done.
    """
    host = os.getenv("SFTP_HOST")
    port = int(os.getenv("SFTP_PORT", 22))
    username = os.getenv("SFTP_USERNAME")
    password = os.getenv("SFTP_PASSWORD")
    
    if not host or not username or not password:
        raise HTTPException(status_code=500, detail="SFTP credentials are not set in environment variables.")

    ssh_client = SSHClient()
    ssh_client.set_missing_host_key_policy(AutoAddPolicy())
    ssh_client.connect(hostname=host, port=port, username=username, password=password)

    sftp_client = ssh_client.open_sftp()
    try:
        yield sftp_client
    finally:
        sftp_client.close()
        ssh_client.close()


def iter_sftp_file(sftp: SFTPClient, path: str, chunk_size: int = 16_384):
    """
    Generator that reads from the remote SFTP file in fixed-size chunks.
    """
    remote_file = sftp.open(path, "rb")
    try:
        while True:
            chunk = remote_file.read(chunk_size)
            if not chunk:
                break
            yield chunk
    finally:
        remote_file.close()


def stream_sftp_file(path: str, chunk_size: int = 16_384):
    """
    Generator that:
      1. Opens an SSH + SFTP session
      2. Opens the remote file
      3. Yields it in chunks
      4. Closes file, sftp, ssh when done
    """
    host = os.getenv("SFTP_HOST")
    port = int(os.getenv("SFTP_PORT", 22))
    user = os.getenv("SFTP_USERNAME")
    pwd  = os.getenv("SFTP_PASSWORD") 

    if not all([host, user, pwd]):
        raise HTTPException(500, "SFTP credentials not set")

    # Connect to SSH
    ssh = SSHClient()
    ssh.set_missing_host_key_policy(AutoAddPolicy())
    ssh.connect(hostname=host, port=port, username=user, password=pwd)
    sftp = ssh.open_sftp()

    try:
        attrs = sftp.stat(path)
        if S_ISDIR(attrs.st_mode):
            raise HTTPException(400, f"{path} is a directory, not a file")

        # Open and stream
        remote = sftp.open(path, "rb")
        try:
            while True:
                chunk = remote.read(chunk_size)
                if not chunk:
                    break
                yield chunk
        finally:
            remote.close()

    finally:
        sftp.close()
        ssh.close()


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

# Models
class FileInfo(BaseModel):
    name: str
    size: int
    modified: datetime
    is_dir: bool


def stream_directory_as_zip(
    root: str,
    chunk_size: int = 16_384
):
    """
    Lazily walks the remote SFTP tree under `root`, and streams back
    a ZIP archive, chunk by chunk, without buffering the whole ZIP.
    """
    host = os.getenv("SFTP_HOST")
    port = int(os.getenv("SFTP_PORT", 22))
    user = os.getenv("SFTP_USERNAME")
    pwd  = os.getenv("SFTP_PASSWORD")
    if not all([host, user, pwd]):
        raise HTTPException(500, "Missing SFTP credentials")

    ssh = SSHClient()
    ssh.set_missing_host_key_policy(AutoAddPolicy())
    ssh.connect(hostname=host, port=port, username=user, password=pwd)
    sftp = ssh.open_sftp()

    z = ZipStream(mode="w", compression=ZIP_DEFLATED)

    def walk(path):
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

            def file_iter(fp=remote_path):
                rf = sftp.open(fp, "rb")
                try:
                    while True:
                        data = rf.read(chunk_size)
                        if not data:
                            break
                        yield data
                finally:
                    rf.close()

            z.write_iter(arcname, file_iter())

    try:
        for chunk in z:
            yield chunk
    finally:
        sftp.close()
        ssh.close()


# Routes
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
    


@app.get("/files/meta/", response_model=List[FileInfo], summary="Get metadata for a directory")
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
            stream_directory_as_zip(path),               
            media_type="application/zip",
            headers={
                "Content-Disposition": 
                  f'attachment; filename="{archive_name}.zip"'
            }
        )

    return StreamingResponse(
        stream_sftp_file(path),                         
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": 
              f'attachment; filename="{os.path.basename(path)}"'
        }
    )