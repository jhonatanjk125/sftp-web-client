import type { FileInfo } from "./types";

const API_BASE =
  import.meta.env.VITE_API_BASE && import.meta.env.VITE_API_BASE.length > 0
    ? import.meta.env.VITE_API_BASE
    : "/api";

async function handleJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      if (data?.detail) msg = data.detail;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export async function login(params: {
  host: string;
  port?: number;
  username: string;
  password: string;
}): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params)
  });
  await handleJson<{ message: string }>(res);
}

export async function logout(): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include"
  });
  await handleJson<{ message: string }>(res);
}

export async function listMeta(path: string): Promise<FileInfo[]> {
  const url = new URL(`${API_BASE}/files/meta/`, window.location.origin);
  url.searchParams.set("path", path);
  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include"
  });
  return handleJson<FileInfo[]>(res);
}

export function getDownloadUrl(path: string): string {
  const url = new URL(`${API_BASE}/files/download/`, window.location.origin);
  url.searchParams.set("path", path);
  return url.pathname + url.search; // keep same-origin relative for proxy
}

export async function mkdir(path: string): Promise<void> {
  const res = await fetch(`${API_BASE}/files/mkdir/`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path })
  });
  await handleJson<{ created: string }>(res);
}

export async function deletePaths(paths: string[]): Promise<{
  deleted: string[];
  failed: { path: string; error: string }[];
}> {
  const res = await fetch(`${API_BASE}/files/delete/`, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paths)
  });
  return handleJson(res);
}

export async function renamePath(
  old_path: string,
  new_path: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/files/rename/`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ old_path, new_path })
  });
  await handleJson(res);
}

export async function uploadFiles(
  destDir: string,
  files: File[]
): Promise<{ uploaded: string[] }> {
  const url = new URL(`${API_BASE}/files/upload/`, window.location.origin);
  url.searchParams.set("dest_dir", destDir);
  const form = new FormData();
  for (const f of files) {
    form.append("uploads", f, f.name);
  }
  const res = await fetch(url.toString(), {
    method: "POST",
    credentials: "include",
    body: form
  });
  return handleJson(res);
}

export async function probeSession(): Promise<boolean> {
  try {
    await listMeta(".");
    return true;
  } catch {
    return false;
  }
}