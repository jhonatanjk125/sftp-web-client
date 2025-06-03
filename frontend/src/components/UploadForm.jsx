import React, { useState, useRef } from "react";

export function UploadForm({ currentPath, onUploadSuccess }) {
  const [files, setFiles] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Whenever the user selects (or drops) files, store them in state
  const handleChange = (e) => {
    setFiles(e.target.files);
    setError(null);
  };

  // If files are dragged over the dropzone, prevent default to allow drop
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // If files are dropped, grab them and store into state
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(e.dataTransfer.files);
      setError(null);
      e.dataTransfer.clearData();
    }
  };

  // When the user clicks “Choose Files,” we forward that click to the hidden <input />
  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files || files.length === 0) {
      setError("Please select at least one file.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();

      for (let i = 0; i < files.length; i++) {
        formData.append("uploads", files[i]);
      }

      const url = `/api/files/upload/?dest_dir=${encodeURIComponent(currentPath)}`;

      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      onUploadSuccess();
      setFiles(null);
      e.target.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      {/* ───────── Dropzone ───────── */}
      <div
        className="upload-dropzone"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <div className="upload-icon">☁️⤴️</div>
        <p className="upload-heading">Upload Files</p>
        <p className="upload-text">
          Drag &amp; drop files here or click to browse
        </p>
        <p className="upload-subtext">Supports multiple file uploads</p>

        <button
          type="button"
          className="upload-choose"
          onClick={(e) => {
            e.stopPropagation();
            openFileDialog();
          }}
        >
          Choose Files
        </button>

        {/* Hidden file input: we trigger it from the dropzone or the “Choose Files” button */}
        <input
          id="file-upload"
          ref={fileInputRef}
          type="file"
          multiple
          className="upload-input-hidden"
          onChange={handleChange}
        />
      </div>

      {/* If there’s an error, show it */}
      {error && <div className="upload-error">{error}</div>}

      {/* Submit button at bottom */}
      <button
        type="submit"
        disabled={uploading}
        className="upload-submit"
      >
        {uploading ? "Uploading…" : "Upload"}
      </button>
    </form>
  );
}