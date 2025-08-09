export type PalettePresetName =
  | "jade"
  | "forest"
  | "ocean"
  | "sapphire"
  | "indigo"
  | "violet"
  | "coral"
  | "amber"
  | "slate"
  | "graphite";

type Preset = {
  primaryDark: string;
  primaryLight: string;
  secondaryDark: string;
  secondaryLight: string;
  gradients: {
    brand: string;
    accent: string;
    success: string;
    warning: string;
  };
  background: {
    radials: {
      dark: [string, string, string, string];
      light: [string, string, string, string];
    };
    blobs: {
      dark: [string, string, string];
      light: [string, string, string];
    };
  };
};

export const palettes: Record<PalettePresetName, Preset> = {
  // ───────────── Greens (subtle) ─────────────
  jade: {
    primaryDark: "#10B981",
    primaryLight: "#15803D",
    secondaryDark: "#34D399",
    secondaryLight: "#86EFAC",
    gradients: {
      brand:
        "linear-gradient(135deg, #15803D 0%, #22C55E 50%, #A7F3D0 100%)",
      accent: "linear-gradient(135deg, #DEF7EC 0%, #A7F3D0 100%)",
      success: "linear-gradient(135deg, #16A34A 0%, #34D399 100%)",
      warning: "linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)"
    },
    background: {
      radials: {
        dark: ["#0d2016", "#0f2319", "#10261b", "#0e2419"],
        light: ["#eafbf0", "#e7f7ef", "#e6fbf3", "#f2fdf6"]
      },
      blobs: {
        dark: [
          "rgba(34,197,94,0.38)",
          "rgba(16,185,129,0.32)",
          "rgba(52,211,153,0.28)"
        ],
        light: [
          "rgba(34,197,94,0.24)",
          "rgba(16,185,129,0.20)",
          "rgba(52,211,153,0.18)"
        ]
      }
    }
  },

  forest: {
    primaryDark: "#16A34A",
    primaryLight: "#166534",
    secondaryDark: "#A3E635",
    secondaryLight: "#65A30D",
    gradients: {
      brand:
        "linear-gradient(135deg, #166534 0%, #16A34A 50%, #A3E635 100%)",
      accent: "linear-gradient(135deg, #E7F9DF 0%, #D9F99D 100%)",
      success: "linear-gradient(135deg, #15803D 0%, #22C55E 100%)",
      warning: "linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)"
    },
    background: {
      radials: {
        dark: ["#0c1f15", "#0e2319", "#102318", "#11271a"],
        light: ["#effcf5", "#ebf8ef", "#e9f7ee", "#f3fdf6"]
      },
      blobs: {
        dark: [
          "rgba(22,163,74,0.36)",
          "rgba(101,163,13,0.30)",
          "rgba(163,230,53,0.26)"
        ],
        light: [
          "rgba(22,163,74,0.22)",
          "rgba(101,163,13,0.18)",
          "rgba(163,230,53,0.16)"
        ]
      }
    }
  },

  // ───────────── Blues (subtle) ─────────────
  ocean: {
    primaryDark: "#0EA5E9",
    primaryLight: "#0E7490",
    secondaryDark: "#22D3EE",
    secondaryLight: "#38BDF8",
    gradients: {
      brand:
        "linear-gradient(135deg, #0E7490 0%, #0EA5E9 50%, #BAE6FD 100%)",
      accent: "linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)",
      success: "linear-gradient(135deg, #10B981 0%, #38BDF8 100%)",
      warning: "linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)"
    },
    background: {
      radials: {
        dark: ["#0a1e2a", "#0b2230", "#0b2432", "#0a2533"],
        light: ["#e6f7ff", "#e8f7fd", "#eaf6ff", "#eaf6ff"]
      },
      blobs: {
        dark: [
          "rgba(14,165,233,0.36)",
          "rgba(6,182,212,0.30)",
          "rgba(34,211,238,0.26)"
        ],
        light: [
          "rgba(14,165,233,0.22)",
          "rgba(6,182,212,0.18)",
          "rgba(34,211,238,0.16)"
        ]
      }
    }
  },

  sapphire: {
    primaryDark: "#2563EB",
    primaryLight: "#1D4ED8",
    secondaryDark: "#60A5FA",
    secondaryLight: "#93C5FD",
    gradients: {
      brand:
        "linear-gradient(135deg, #1D4ED8 0%, #2563EB 50%, #93C5FD 100%)",
      accent: "linear-gradient(135deg, #E3EEFF 0%, #BFDBFE 100%)",
      success: "linear-gradient(135deg, #10B981 0%, #60A5FA 100%)",
      warning: "linear-gradient(135deg, #F59E0B 0%, #FB923C 100%)"
    },
    background: {
      radials: {
        dark: ["#0d1730", "#0e1a36", "#101d3d", "#0e1f3d"],
        light: ["#e8f0ff", "#e9f3ff", "#e9f1ff", "#eef3ff"]
      },
      blobs: {
        dark: [
          "rgba(37,99,235,0.36)",
          "rgba(59,130,246,0.30)",
          "rgba(96,165,250,0.26)"
        ],
        light: [
          "rgba(37,99,235,0.22)",
          "rgba(59,130,246,0.18)",
          "rgba(96,165,250,0.16)"
        ]
      }
    }
  },

  // ───────────── Purples (subtle) ─────────────
  indigo: {
    primaryDark: "#6366F1",
    primaryLight: "#4F46E5",
    secondaryDark: "#A78BFA",
    secondaryLight: "#C4B5FD",
    gradients: {
      brand:
        "linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #C4B5FD 100%)",
      accent: "linear-gradient(135deg, #ECEBFF 0%, #DDD6FE 100%)",
      success: "linear-gradient(135deg, #22C55E 0%, #6366F1 100%)",
      warning: "linear-gradient(135deg, #F59E0B 0%, #FB923C 100%)"
    },
    background: {
      radials: {
        dark: ["#151634", "#1a1a3d", "#181a33", "#1b2044"],
        light: ["#ecefff", "#eef0ff", "#edefff", "#f1f3ff"]
      },
      blobs: {
        dark: [
          "rgba(99,102,241,0.36)",
          "rgba(139,92,246,0.30)",
          "rgba(167,139,250,0.26)"
        ],
        light: [
          "rgba(99,102,241,0.22)",
          "rgba(139,92,246,0.18)",
          "rgba(167,139,250,0.16)"
        ]
      }
    }
  },

  violet: {
    primaryDark: "#A78BFA",
    primaryLight: "#8B5CF6",
    secondaryDark: "#F472B6",
    secondaryLight: "#F5D0FE",
    gradients: {
      brand:
        "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 50%, #F5D0FE 100%)",
      accent: "linear-gradient(135deg, #F7EAFE 0%, #FBCFE8 100%)",
      success: "linear-gradient(135deg, #34D399 0%, #A78BFA 100%)",
      warning: "linear-gradient(135deg, #F59E0B 0%, #FB923C 100%)"
    },
    background: {
      radials: {
        dark: ["#1d1630", "#21183a", "#251a40", "#271a43"],
        light: ["#f5efff", "#f7f0ff", "#f8eefe", "#faefff"]
      },
      blobs: {
        dark: [
          "rgba(167,139,250,0.34)",
          "rgba(236,72,153,0.28)",
          "rgba(244,114,182,0.24)"
        ],
        light: [
          "rgba(167,139,250,0.20)",
          "rgba(236,72,153,0.18)",
          "rgba(244,114,182,0.16)"
        ]
      }
    }
  },

  // ───────────── Oranges/Ambers (subtle) ─────────────
  coral: {
    primaryDark: "#F97316",
    primaryLight: "#EA580C",
    secondaryDark: "#F59E0B",
    secondaryLight: "#FCD34D",
    gradients: {
      brand:
        "linear-gradient(135deg, #EA580C 0%, #F59E0B 50%, #FED7AA 100%)",
      accent: "linear-gradient(135deg, #FFE8CC 0%, #FDE68A 100%)",
      success: "linear-gradient(135deg, #22C55E 0%, #F59E0B 100%)",
      warning: "linear-gradient(135deg, #FB923C 0%, #F97316 100%)"
    },
    background: {
      radials: {
        dark: ["#2e1a12", "#331d14", "#361e15", "#382015"],
        light: ["#fff3e9", "#fff0e6", "#fff1ea", "#ffeede"]
      },
      blobs: {
        dark: [
          "rgba(249,115,22,0.34)",
          "rgba(245,158,11,0.28)",
          "rgba(234,88,12,0.26)"
        ],
        light: [
          "rgba(249,115,22,0.20)",
          "rgba(245,158,11,0.18)",
          "rgba(234,88,12,0.16)"
        ]
      }
    }
  },

  amber: {
    primaryDark: "#F59E0B",
    primaryLight: "#D97706",
    secondaryDark: "#FDE68A",
    secondaryLight: "#FCD34D",
    gradients: {
      brand:
        "linear-gradient(135deg, #D97706 0%, #F59E0B 50%, #FDE68A 100%)",
      accent: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
      success: "linear-gradient(135deg, #22C55E 0%, #F59E0B 100%)",
      warning: "linear-gradient(135deg, #FB923C 0%, #F97316 100%)"
    },
    background: {
      radials: {
        dark: ["#2a1e0c", "#2c1f0e", "#2f210f", "#312311"],
        light: ["#fff7ea", "#fff4e2", "#fff3de", "#fff6ea"]
      },
      blobs: {
        dark: [
          "rgba(245,158,11,0.34)",
          "rgba(253,230,138,0.28)",
          "rgba(251,146,60,0.24)"
        ],
        light: [
          "rgba(245,158,11,0.20)",
          "rgba(253,230,138,0.16)",
          "rgba(251,146,60,0.14)"
        ]
      }
    }
  },

  // ───────────── Neutrals (subtle) ─────────────
  slate: {
    primaryDark: "#64748B",
    primaryLight: "#475569",
    secondaryDark: "#94A3B8",
    secondaryLight: "#CBD5E1",
    gradients: {
      brand:
        "linear-gradient(135deg, #475569 0%, #64748B 50%, #CBD5E1 100%)",
      accent: "linear-gradient(135deg, #E2E8F0 0%, #CBD5E1 100%)",
      success: "linear-gradient(135deg, #22C55E 0%, #64748B 100%)",
      warning: "linear-gradient(135deg, #FBBF24 0%, #94A3B8 100%)"
    },
    background: {
      radials: {
        dark: ["#0f1419", "#141924", "#161c28", "#12182b"],
        light: ["#f1f5f9", "#e2e8f0", "#f8fafc", "#f1f5fb"]
      },
      blobs: {
        dark: [
          "rgba(100,116,139,0.32)",
          "rgba(148,163,184,0.28)",
          "rgba(71,85,105,0.26)"
        ],
        light: [
          "rgba(100,116,139,0.20)",
          "rgba(148,163,184,0.18)",
          "rgba(71,85,105,0.16)"
        ]
      }
    }
  },

  graphite: {
    primaryDark: "#78716C",
    primaryLight: "#57534E",
    secondaryDark: "#A8A29E",
    secondaryLight: "#D6D3D1",
    gradients: {
      brand:
        "linear-gradient(135deg, #57534E 0%, #78716C 50%, #E7E5E4 100%)",
      accent: "linear-gradient(135deg, #F5F5F4 0%, #E7E5E4 100%)",
      success: "linear-gradient(135deg, #22C55E 0%, #78716C 100%)",
      warning: "linear-gradient(135deg, #FBBF24 0%, #A8A29E 100%)"
    },
    background: {
      radials: {
        dark: ["#1c1917", "#1f1e1b", "#262320", "#292621"],
        light: ["#fafaf9", "#f5f5f4", "#e7e5e4", "#f9f8f7"]
      },
      blobs: {
        dark: [
          "rgba(120,113,108,0.30)",
          "rgba(168,162,158,0.26)",
          "rgba(87,83,78,0.24)"
        ],
        light: [
          "rgba(120,113,108,0.18)",
          "rgba(168,162,158,0.16)",
          "rgba(87,83,78,0.14)"
        ]
      }
    }
  }
};

export const PALETTE_OPTIONS: {
  name: PalettePresetName;
  label: string;
}[] = [
  // Greens
  { name: "jade", label: "Jade " },
  { name: "forest", label: "Forest " },
  // Blues
  { name: "ocean", label: "Ocean " },
  { name: "sapphire", label: "Sapphire " },
  // Purples
  { name: "indigo", label: "Indigo " },
  { name: "violet", label: "Violet " },
  // Oranges/Ambers
  { name: "coral", label: "Coral " },
  { name: "amber", label: "Amber " },
  // Neutrals
  { name: "slate", label: "Slate " },
  { name: "graphite", label: "Graphite " }
];