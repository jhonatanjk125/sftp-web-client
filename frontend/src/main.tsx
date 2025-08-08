import {
  CssBaseline,
  GlobalStyles,
  ThemeProvider
} from "@mui/material";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import makeTheme from "./theme";
import Background from "./components/Background";

function getInitialMode(): "light" | "dark" {
  const stored = localStorage.getItem("theme-mode");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function Root() {
  const [mode, setMode] = React.useState<"light" | "dark">(
    getInitialMode()
  );

  React.useEffect(() => {
    localStorage.setItem("theme-mode", mode);
  }, [mode]);

  const theme = React.useMemo(() => makeTheme(mode), [mode]);

  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            html: { height: "100%" },
            body: {
              height: "100%",
              colorScheme: mode,
              backgroundColor:
                mode === "dark" ? "#0b0f15" : "#f6f8fb"
            },
            "#root": { height: "100%" },
            "@keyframes auroraFloat1": {
              "0%": { transform: "translate3d(-10vw, -5vh, 0) scale(1)" },
              "100%": { transform: "translate3d(20vw, -10vh, 0) scale(1.25)" }
            },
            "@keyframes auroraFloat2": {
              "0%": { transform: "translate3d(10vw, 10vh, 0) scale(1)" },
              "100%": { transform: "translate3d(-20vw, 5vh, 0) scale(1.2)" }
            },
            "@keyframes auroraFloat3": {
              "0%": { transform: "translate3d(-5vw, 15vh, 0) scale(1)" },
              "100%": { transform: "translate3d(15vw, -15vh, 0) scale(1.15)" }
            },
            "@keyframes gradientShift": {
              "0%": { backgroundPosition: "0% 50%" },
              "100%": { backgroundPosition: "100% 50%" }
            },
            "@media (prefers-reduced-motion: reduce)": {
              "*": { animation: "none !important", transition: "none !important" }
            }
          }}
        />
        <Background mode={mode} />
        <App
          mode={mode}
          onToggleTheme={() =>
            setMode((m) => (m === "dark" ? "light" : "dark"))
          }
        />
      </ThemeProvider>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<Root />);