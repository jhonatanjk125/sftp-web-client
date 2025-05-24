import React from "react";

/**
 * props:
 *   entries:     Array<{ name: string, is_dir: boolean }>
 *   onDrillDown: (folderName: string) => void
 *   onDownload: (fileName: string) => void
 */
export function FileList({ entries, onDrillDown, onDownload }) {
  if (entries.length === 0) {
    return <div>(Empty directory)</div>;
  }


  return (
    <ul>
      {entries.map(({ name, is_dir }) => (
        <li key={name} className="py-1">
          {is_dir ? (
            <button
              className="list-folder"
              onClick={() => onDrillDown(name)}
            >
              📁 {name}
            </button>
          ) : (
            <button
              className="list-file"
              onClick={() => onDownload(name)}
            >
              📄 {name}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
