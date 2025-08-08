export type FileInfo = {
  name: string;
  size: number;
  modified: string; // ISO timestamp
  is_dir: boolean;
};