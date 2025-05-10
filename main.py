import os
from typing import List
from fastapi import FastAPI, Depends, HTTPException, Query
from paramiko import SSHClient, AutoAddPolicy, SFTPClient
from dotenv import load_dotenv
from pydantic import BaseModel
from datetime import datetime
from stat import S_ISDIR
from fastapi.responses import StreamingResponse


load_dotenv()

app = FastAPI(title="SFTP Web Client API")

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
    
class FileInfo(BaseModel):
    name: str
    size: int
    modified: datetime
    is_dir: bool

@app.get("/files/meta/", response_model=List[FileInfo], summary="Get metadata for a directory")
def list_with_meta(
    path: str = Query(".", description="Remote directory path"),
    sftp: SFTPClient = Depends(get_sftp_client)
) -> List[FileInfo]:
    try:
        entries: List[FileInfo] = []
        for name in sftp.listdir(path):             # no await
            full_path = f"{path.rstrip('/')}/{name}"
            attrs = sftp.stat(full_path)            # no await
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