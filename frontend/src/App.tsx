import { Alert, Box, CircularProgress, Snackbar } from "@mui/material";
import React from "react";
import { logout, probeSession } from "./api";
import FileBrowser from "./components/FileBrowser";
import LoginForm from "./components/LoginForm";

type Props = {
  mode: "light" | "dark";
  onToggleTheme: () => void;
};

export default function App({ mode, onToggleTheme }: Props) {
  const [checking, setChecking] = React.useState(true);
  const [authed, setAuthed] = React.useState(false);
  const [snack, setSnack] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const ok = await probeSession();
      setAuthed(ok);
      setChecking(false);
    })();
  }, []);

  async function doLogout() {
    try {
      await logout();
      setAuthed(false);
      setSnack("Logged out");
    } catch {
      setAuthed(false);
    }
  }

  if (checking) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress />
      </Box>
    );
  }

  return authed ? (
    <>
      <FileBrowser
        mode={mode}
        onToggleTheme={onToggleTheme}
        onLogout={() => {
          void doLogout();
        }}
      />
      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={3000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack(null)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snack}
        </Alert>
      </Snackbar>
    </>
  ) : (
    <LoginForm
      mode={mode}
      onToggleTheme={onToggleTheme}
      onLoggedIn={() => {
        setAuthed(true);
      }}
    />
  );
}