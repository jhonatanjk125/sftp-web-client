export function normalizePath(p: string): string {
  if (!p || p === ".") return ".";
  // Remove trailing slashes except root
  if (p.endsWith("/")) p = p.replace(/\/+$/, "");
  if (p === "") return ".";
  return p;
}

export function joinPaths(...parts: string[]): string {
  const filtered = parts
    .filter(Boolean)
    .map((p) => p.replace(/\/+/g, "/").replace(/^\.\/+/, "").replace(/\/+$/, ""));
  if (filtered.length === 0) return ".";
  let result = filtered[0] === "." ? "." : `/${filtered[0].replace(/^\//, "")}`;
  for (let i = 1; i < filtered.length; i++) {
    const seg = filtered[i].replace(/^\//, "");
    result = result === "." ? `./${seg}` : `${result}/${seg}`;
  }
  // Keep "." when it's alone
  if (result === "/") return ".";
  return result;
}

export function parentDir(p: string): string {
  p = normalizePath(p);
  if (p === ".") return ".";
  const parts = p.replace(/^\.\//, "").split("/");
  parts.pop();
  if (parts.length === 0) return ".";
  return joinPaths(...parts);
}

export function basename(p: string): string {
  if (p === ".") return ".";
  const parts = p.replace(/\/+$/, "").split("/");
  return parts[parts.length - 1] || ".";
}

export function isRoot(p: string): boolean {
  return p === ".";
}