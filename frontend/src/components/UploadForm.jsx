import React, { useState } from "react";

export function UploadForm({ currentPath, onUploadSuccess }) {
  const [files, setFiles] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFiles(e.target.files);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files || files.length === 0) {
      setError("Please select at least one file.");
      return;
    }

    setUploading(true);
    setError(null);

    // Build FormData using the exact field name your API expects:
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("uploads", file);
    });

    try {
      // Pass dest_dir as a query param
      const url = `/files/upload?dest_dir=${encodeURIComponent(currentPath)}`;
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const text = await res.text();
      if (!res.ok) {
        console.error("Upload failed:", res.status, text);
        throw new Error(`Upload failed (${res.status})`);
      }

      // on success, clear and refresh
      setFiles(null);
      e.target.reset();
      onUploadSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <input
        type="file"
        multiple
        className="upload-input"
        onChange={handleChange}
      />
      <button type="submit" disabled={uploading} className="upload-button">
        {uploading ? "Uploading…" : "Upload"}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}
