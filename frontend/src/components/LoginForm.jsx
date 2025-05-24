import React, { useState } from 'react';
import { useAuth } from './AuthContext';

export function LoginForm() {
  const { login, error } = useAuth();
  const [form, setForm] = useState({
    host: '',
    port: 22,
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
    } catch {
      // error state is set in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h2 className="form-title">SFTP Login</h2>

      <div className="form-group">
        <label htmlFor="host">Host</label>
        <input
          id="host"
          name="host"
          type="text"
          value={form.host}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="port">Port</label>
        <input
          id="port"
          name="port"
          type="number"
          value={form.port}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          type="text"
          value={form.username}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <button className="btn-primary" type="submit" disabled={loading}>
        {loading ? 'Logging in…' : 'Log In'}
      </button>
    </form>
  );
}