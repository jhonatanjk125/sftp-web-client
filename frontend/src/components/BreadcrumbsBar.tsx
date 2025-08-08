import {
  Breadcrumbs,
  Chip,
  Link as MuiLink,
  Stack,
  Typography
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import React from "react";
import { basename, isRoot, joinPaths } from "../utils/path";

type Props = {
  path: string;
  onNavigate: (p: string) => void;
};

export default function BreadcrumbsBar({ path, onNavigate }: Props) {
  const theme = useTheme();
  const light = theme.palette.mode === "light";

  const parts = React.useMemo(() => {
    if (isRoot(path)) return ["."];
    const norm = path.replace(/^\.\//, "");
    const segs = norm.split("/").filter(Boolean);
    return ["." as const, ...segs];
  }, [path]);

  function pathForIndex(i: number) {
    if (i === 0) return ".";
    return joinPaths(...parts.slice(1, i + 1));
  }

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Typography
        variant="subtitle2"
        sx={{
          color: theme.palette.text.secondary
        }}
      >
      </Typography>
      <Breadcrumbs separator="›" aria-label="breadcrumb">
        {parts.map((p, i) => {
          const full = pathForIndex(i);
          const label = p === "." ? "Home" : p;
          const isLast = i === parts.length - 1;

          if (isLast) {
            return (
              <Chip
                key={i}
                label={label}
                size="small"
                sx={{
                  // Force high-contrast chip for the current crumb
                  color: theme.palette.text.primary,
                  backgroundColor: light
                    ? alpha("#000", 0.06)
                    : alpha("#fff", 0.08),
                  borderColor: light
                    ? alpha("#000", 0.12)
                    : alpha("#fff", 0.18),
                  borderWidth: 1,
                  borderStyle: "solid",
                  fontWeight: 600
                }}
              />
            );
          }

          return (
            <MuiLink
              key={i}
              underline="hover"
              sx={{
                cursor: "pointer",
                color: theme.palette.text.primary,
                "&:hover": {
                  color: light
                    ? theme.palette.primary.main
                    : alpha("#fff", 0.9)
                },
                fontWeight: 500
              }}
              onClick={() => onNavigate(full)}
            >
              {label}
            </MuiLink>
          );
        })}
      </Breadcrumbs>
    </Stack>
  );
}