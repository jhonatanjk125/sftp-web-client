import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import React from "react";
import { login } from "../api";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

type Props = {
  onLoggedIn: () => void;
  mode: "light" | "dark";
  onToggleTheme: () => void;
};

export default function LoginForm({
  onLoggedIn,
  mode,
  onToggleTheme
}: Props) {
  const [host, setHost] = React.useState("");
  const [port, setPort] = React.useState<number>(22);
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ host, port, username, password });
      onLoggedIn();
    } catch (err) {
      setError((err as Error).message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{ p: 2 }}
    >
      {/* Theme toggle (visible on login screen) */}
      <Box
        sx={{
          position: "fixed",
          top: 12,
          right: 12,
          zIndex: 10
        }}
      >
        <Tooltip
          arrow
          title={
            mode === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          <IconButton onClick={onToggleTheme} size="large">
            {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      <Card
        sx={{
          width: 460,
          maxWidth: "92vw",
          position: "relative",
          overflow: "visible"
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(60rem 60rem at -10% -10%, " +
              "rgba(134,168,231,0.18), transparent 60%)," +
              "radial-gradient(60rem 60rem at 110% 110%, " +
              "rgba(250,208,196,0.18), transparent 60%)"
          }}
        />
        <CardContent>
          <Stack spacing={2} component="form" onSubmit={handleSubmit}>
            <Typography
              variant="h5"
              textAlign="center"
              sx={{
                fontWeight: 900,
                background:
                  "linear-gradient(90deg, #86A8E7, #91EAE4, #86A8E7)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                letterSpacing: 0.5,
                animation: "gradientShift 8s ease-in-out infinite alternate"
              }}
            >
              SFTP Web Client
            </Typography>
            <Typography
              variant="body2"
              textAlign="center"
              sx={{ opacity: 0.7, mb: 1 }}
            >
              Securely connect to your server with a modern, glass UI.
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Host"
              required
              value={host}
              onChange={(e) => setHost(e.target.value)}
            />
            <Stack direction="row" spacing={1}>
              <TextField
                label="Port"
                type="number"
                value={port}
                onChange={(e) => setPort(Number(e.target.value))}
                sx={{ flex: "0 0 140px" }}
              />
              <TextField
                label="Username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{ flex: 1 }}
              />
            </Stack>
            <TextField
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.3,
                boxShadow: "0 10px 30px rgba(134,168,231,0.35)"
              }}
            >
              {loading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                "Connect"
              )}
            </Button>
            <Typography variant="caption" textAlign="center" sx={{ opacity: 0.7 }}>
              Your credentials are used only to open an SFTP session on
              the server; cookies are secure and HTTP-only.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}