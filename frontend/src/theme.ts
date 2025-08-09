import { alpha, createTheme } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";
import type { PalettePresetName } from "./palette";
import { palettes } from "./palette";

export default function makeTheme(
  mode: PaletteMode,
  preset: PalettePresetName
) {
  const isDark = mode === "dark";
  const p = palettes[preset];

  const primaryMain = isDark ? p.primaryDark : p.primaryLight;
  const secondaryMain = isDark ? p.secondaryDark : p.secondaryLight;

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

  // Label vertical centering (kept from earlier)
  const labelRestY = 14;
  const labelRestYSmall = 10;
  const labelShrinkY = -8;

  return createTheme({
    palette: {
      mode,
      primary: { main: primaryMain },
      secondary: { main: secondaryMain },
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
            overflow: "visible" // avoid clipping inside glass surfaces
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
            overflow: "visible" // critical for floating labels
          }
        }
      },
      // Ensure dialog content itself doesn't clip children
      MuiDialogContent: {
        styleOverrides: {
          root: {
            overflow: "visible",
            position: "relative"
          }
        }
      },
      // Prevent any FormControl from clipping its floating label
      MuiFormControl: {
        styleOverrides: {
          root: {
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
            WebkitBackdropFilter: "blur(14px)"
          }
        }
      },
      // Input/label stacking fixes + centered resting label
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: alpha(isDark ? "#fff" : "#000", isDark ? 0.05 : 0.02),
            borderRadius: 12,
            position: "relative", // create a local stacking context
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: alpha(isDark ? "#fff" : "#000", 0.12),
              zIndex: 1 // sit below the label
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: alpha(isDark ? "#fff" : "#000", 0.22)
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: alpha(primaryMain, 0.6)
            }
          },
          input: { padding: "14px 14px", lineHeight: 1.5 },
          inputSizeSmall: { padding: "10px 14px" }
        }
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            zIndex: 2, // draw above the notched outline
            pointerEvents: "none",
            transition: "transform .2s ease",
            "&.MuiInputLabel-outlined": {
              transform: `translate(14px, ${labelRestY}px) scale(1)`,
              color: isDark ? alpha("#fff", 0.7) : "#334155"
            },
            "&.MuiInputLabel-sizeSmall.MuiInputLabel-outlined": {
              transform: `translate(14px, ${labelRestYSmall}px) scale(1)`
            },
            "&.MuiInputLabel-shrink": {
              transform: `translate(14px, ${labelShrinkY}px) scale(0.75)`,
              color: isDark ? alpha("#fff", 0.8) : "#0b1220"
            }
          }
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
            backgroundImage: p.gradients.brand,
            color: "#0b0f15",
            boxShadow: `0 6px 20px ${alpha(primaryMain, 0.35)}`,
            "&:hover": { filter: "brightness(1.06)" }
          },
          containedSecondary: {
            backgroundImage: p.gradients.accent,
            color: "#0b0f15",
            boxShadow: `0 6px 20px ${alpha(secondaryMain, 0.35)}`,
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
            borderBottom: `1px solid ${alpha("#000", isDark ? 0.12 : 0.08)}`
          }
        }
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
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