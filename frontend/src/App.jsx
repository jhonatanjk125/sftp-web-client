import React, { useState, useEffect } from "react";
import { useAuth } from "./components/AuthContext";
import LoginForm from "./components/LoginForm";
import { Breadcrumbs } from "./components/Breadcrumbs";
import { FileList }   from "./components/FileList";
import "./App.css";

export default function App() {
  const { user, logout } = useAuth();
  const [desiredPath, setDesiredPath] = useState(".");
  const [currentPath, setCurrentPath] = useState(".");
  const [entries, setEntries]         = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);

  useEffect(() => {
    if (!user) return;             

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
  }, [desiredPath, user]);        

  if (!user) {
    return (
      <div className="app-wrapper">
        <div className="app-card">
          <LoginForm />
        </div>
      </div>
    );
  }

  // Authenticated user, show the file browser and logout button
  return (
    <div className="app-wrapper">
      <div className="app-card">
        <div className="app-header">
          <h1 className="app-title">🔗 SFTP Browser</h1>
          <button className="btn-logout" onClick={logout}>
            Logout
          </button>
        </div>

        <Breadcrumbs path={currentPath} onNavigate={setDesiredPath} />

        {error && <div className="error">Error: {error}</div>}
        {loading
          ? <div className="loading">Loading…</div>
          : <FileList
              entries={entries || []}
              onDrillDown={name =>
                setDesiredPath(
                  desiredPath === "." ? name : `${desiredPath}/${name}`
                )
              }
            />
        }
      </div>
    </div>
  );
}