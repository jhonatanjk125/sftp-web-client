import React, { useState, useEffect } from "react";
import { Breadcrumbs } from "./components/Breadcrumbs";
import { FileList }   from "./components/FileList";
import "./App.css";

export default function App() {
  const [desiredPath, setDesiredPath] = useState(".");

  const [currentPath, setCurrentPath] = useState(".");

  const [entries, setEntries] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/files/meta/?path=${encodeURIComponent(desiredPath)}`, {
      credentials: "include",
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setEntries(data);
        setCurrentPath(desiredPath);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [desiredPath]);


  const handleDrillDown = (name) => {
    const next = desiredPath === "." ? name : `${desiredPath}/${name}`;
    setDesiredPath(next);
  };


  const handleCrumbClick = (target) => {
    if (target !== desiredPath) {
      setDesiredPath(target);
    }
  };

  return (
    <div className="app-wrapper">
      <div className="app-card">
        <h1 className="app-title">🔗 SFTP Browser</h1>

        <Breadcrumbs
          path={currentPath}
          onNavigate={handleCrumbClick}
        />

        {error && <div className="error">Error: {error}</div>}
        {loading
          ? <div className="loading">Loading…</div>
          : <FileList
              entries={entries || []}
              onDrillDown={handleDrillDown}
            />
        }
      </div>
    </div>
  );
}