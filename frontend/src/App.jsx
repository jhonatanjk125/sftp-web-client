// File: src/App.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "./components/AuthContext";
import { LoginForm } from "./components/LoginForm";
import { Breadcrumbs } from "./components/Breadcrumbs";
import { FileList } from "./components/FileList";
import { UploadForm } from "./components/UploadForm";

import "./App.css";

export default function App() {
  const { user, logout } = useAuth();
  const [desiredPath, setDesiredPath] = useState(".");
  const [currentPath, setCurrentPath] = useState(".");
  const [entries, setEntries] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);

    fetch(`/api/files/meta/?path=${encodeURIComponent(desiredPath)}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setEntries(data);
        setCurrentPath(desiredPath);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [desiredPath, user, refreshCounter]);

  const handleDownload = (fileName) => {
    const fullPath =
      currentPath === "." ? fileName : `${currentPath}/${fileName}`;
    window.location.href = `/api/files/download/?path=${encodeURIComponent(
      fullPath
    )}`;
  };

  const handleUploadSuccess = () => {
    setRefreshCounter((c) => c + 1);
  };

  const handleDelete = async (name) => {
    const fullPath =
      currentPath === "." ? name : `${currentPath}/${name}`;
    if (!window.confirm(`Delete “${fullPath}”?`)) return;
    try {
      const res = await fetch(`/api/files/delete/`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([fullPath]), // a one‐element array
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
      setRefreshCounter((c) => c + 1);
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  if (!user) {
    return (
      <div className="app-wrapper">
        <div className="app-card">
          <LoginForm />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="header-bar">
        {/* … your existing header bar … */}
      </header>

      <div className="main-content">
        {/* ───── Left Panel: File Explorer ───── */}
        <section className="file-explorer-panel">
          {/* 1) Breadcrumbs + FileList must expand to fill vertical space */}
          <div className="file-list-wrapper">
            <Breadcrumbs path={currentPath} onNavigate={setDesiredPath} />

            {error && <div className="error-message">Error: {error}</div>}
            {loading ? (
              <div className="loading">Loading…</div>
            ) : (
              <div className="file-list-container">
                <FileList
                  entries={entries || []}
                  onDrillDown={(name) =>
                    setDesiredPath(
                      desiredPath === "." ? name : `${desiredPath}/${name}`
                    )
                  }
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                />
              </div>
            )}
          </div>

          {/* 2) UploadForm now sits at the BOTTOM of this panel */}
          <UploadForm
            currentPath={currentPath}
            onUploadSuccess={handleUploadSuccess}
          />
        </section>

        {/* ───── Right Panel: Info Cards ───── */}
        <aside className="info-panel">
          {/* … your Connection Info, Storage Info, Recent Activity cards … */}
        </aside>
      </div>
    </div>
  );
}