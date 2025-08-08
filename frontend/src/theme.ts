import { alpha, createTheme } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";

const gradients = {
  brand:
    "linear-gradient(135deg, #7F7FD5 0%, #86A8E7 50%, #91EAE4 100%)",
  accent: "linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%)",
  success: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  warning: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)"
};

function makeTheme(mode: PaletteMode) {
  const isDark = mode === "dark";

  const glass = isDark
    ? {
        bg: "rgba(255,255,255,0.06)",
        border: "rgba(255,255,255,0.18)",
        shadow: "0 8px 32px rgba(0,0,0,0.35)",
        blur: "blur(14px) saturate(160%)"
      }
    : {
        bg: "rgba(255,255,255,0.72)",
        border: "rgba(0,0,0,0.08)",
        shadow: "0 8px 24px rgba(0,0,0,0.12)",
        blur: "blur(14px) saturate(160%)"
      };

  return createTheme({
    palette: {
      mode,
      primary: { main: isDark ? "#86A8E7" : "#3b82f6" },
      secondary: { main: isDark ? "#FAD0C4" : "#f59e0b" },
      background: {
        default: isDark ? "#0b0f15" : "#f6f8fb",
        paper: isDark ? "#0b0f15" : "#ffffff"
      },
      text: {
        primary: isDark ? alpha("#fff", 0.92) : "#0b1220",
        secondary: isDark ? alpha("#fff", 0.7) : "#334155"
      }
    },
    shape: { borderRadius: 14 },
    typography: {
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", ' +
        "Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial, " +
        '"Apple Color Emoji","Segoe UI Emoji"',
      h5: { fontWeight: 800 }
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            background: glass.bg,
            border: `1px solid ${glass.border}`,
            boxShadow: glass.shadow,
            backdropFilter: glass.blur,
            WebkitBackdropFilter: glass.blur,
            overflow: "visible"
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            background: glass.bg,
            border: `1px solid ${glass.border}`,
            boxShadow: glass.shadow,
            backdropFilter: glass.blur,
            WebkitBackdropFilter: glass.blur,
            overflow: "visible"
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: alpha(
              isDark ? "#0b0f15" : "#ffffff",
              isDark ? 0.35 : 0.8
            ),
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: `1px solid ${alpha("#000", isDark ? 0.26 : 0.08)}`
          }
        }
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            background: glass.bg,
            border: `1px solid ${glass.border}`,
            boxShadow: glass.shadow,
            backdropFilter: glass.blur,
            WebkitBackdropFilter: glass.blur,
            overflow: "visible"
          }
        }
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            background: glass.bg,
            border: `1px solid ${glass.border}`,
            boxShadow: glass.shadow,
            backdropFilter: glass.blur,
            WebkitBackdropFilter: glass.blur
          }
        }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: alpha(
              isDark ? "#fff" : "#000",
              isDark ? 0.05 : 0.02
            ),
            borderRadius: 12,
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: alpha(isDark ? "#fff" : "#000", 0.12)
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: alpha(isDark ? "#fff" : "#000", 0.22)
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: alpha("#86A8E7", 0.6)
            }
          },
          input: { paddingTop: 12, paddingBottom: 12 }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: "none",
            fontWeight: 700,
            letterSpacing: 0.2
          },
          containedPrimary: {
            backgroundImage: gradients.brand,
            color: "#0b0f15",
            boxShadow: "0 6px 20px rgba(134,168,231,0.35)",
            "&:hover": { filter: "brightness(1.06)" }
          },
          containedSecondary: {
            backgroundImage: gradients.accent,
            color: "#0b0f15",
            boxShadow: "0 6px 20px rgba(250,208,196,0.35)",
            "&:hover": { filter: "brightness(1.06)" }
          },
          outlined: {
            borderColor: alpha(isDark ? "#fff" : "#000", 0.22),
            backgroundColor: alpha(isDark ? "#fff" : "#000", 0.03),
            "&:hover": {
              borderColor: alpha(isDark ? "#fff" : "#000", 0.34),
              backgroundColor: alpha(isDark ? "#fff" : "#000", 0.06)
            }
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            color: isDark ? alpha("#fff", 0.92) : "#0b1220",
            background: isDark
              ? alpha("#ffffff", 0.08)
              : alpha("#000000", 0.06),
            border: `1px solid ${alpha("#000", isDark ? 0.18 : 0.12)}`,
            backdropFilter: "blur(8px)"
          }
        }
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            background: alpha(isDark ? "#fff" : "#000", isDark ? 0.06 : 0.03),
            borderBottom: `1px solid ${alpha(
              isDark ? "#fff" : "#000",
              isDark ? 0.14 : 0.08
            )}`,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            fontWeight: 700
          },
          body: {
            borderBottom: `1px solid ${alpha(
              "#000",
              isDark ? 0.12 : 0.08
            )}`
          }
        }
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            // High-contrast tooltip for both modes
            backgroundColor: alpha("#0b1220", 0.96),
            color: "#ffffff",
            border: `1px solid ${alpha("#000", 0.4)}`,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)"
          },
          arrow: {
            color: alpha("#0b1220", 0.96)
          }
        }
      }
    }
  });
}

export default makeTheme;
export { gradients };