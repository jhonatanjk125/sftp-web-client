import React from "react";

/**
 * props:
 *   entries:     Array<{ name: string, is_dir: boolean }>
 *   onDrillDown: (folderName: string) => void
 *   onDownload: (fileName: string) => void
 *   onDelete: (fileName: string) => void
 */
export function FileList({ entries, onDrillDown, onDownload, onDelete }) {
  if (entries.length === 0) {
    return <div>(Empty directory)</div>;
  }

  return (
    <ul>
      {entries.map(({ name, is_dir }) => (
        <li 
        key={name} 
        className={`
        fl-item
        ${is_dir ? "fl-item-folder" : "fl-item-file"}`}>
          {is_dir ? (
            <button
              className="list-folder"
              onClick={() => onDrillDown(name)}
              title={`Open folder “${name}”`}
            >
              📁 {name}
            </button>
          ) : (
            <button
              className="list-file"
              onClick={() => onDownload(name)}
              title={`Download file “${name}”`}
            >
              📄 {name}
            </button>
          )}
          <div className="action-buttons">
          <button
            className="action-button"
            onClick={() =>
              is_dir ? onDrillDown(name) : onDownload(name)
            }
            title={is_dir ? "Open folder" : "Download file"}
          >
            {is_dir ? "📂" : "⬇️"}
          </button>

          {/** — Existing delete “trash” button */}
          <button
            className="delete-button"
            onClick={() => onDelete(name)}
            title="Delete"
          >
            🗑️
          </button>
          </div>
        </li>
      ))}
    </ul>
  );
}