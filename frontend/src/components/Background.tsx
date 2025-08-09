import { Box } from "@mui/material";
import React from "react";
import type { PalettePresetName } from "../palette";
import { palettes } from "../palette";

type Props = {
  mode: "light" | "dark";
  preset: PalettePresetName;
};

export default function Background({ mode, preset }: Props) {
  const dark = mode === "dark";
  const base = dark ? "#0b0f15" : "#f6f8fb";

  const p = palettes[preset];
  const radials = dark
    ? p.background.radials.dark
    : p.background.radials.light;
  const blobs = dark ? p.background.blobs.dark : p.background.blobs.light;

  const positionsDark = ["12% 10%", "88% 18%", "12% 90%", "88% 88%"];
  const positionsLight = ["20% 10%", "80% 80%", "15% 85%", "85% 20%"];
  const positions = dark ? positionsDark : positionsLight;

  const radialCss = radials
    .map(
      (color, i) =>
        `radial-gradient(60rem 60rem at ${positions[i]}, ${color} 0%, transparent 60%)`
    )
    .join(",");

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        overflow: "hidden",
        background: `${radialCss}, linear-gradient(180deg, ${base} 0%, ${base} 100%)`
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "-20vmax",
          left: "-10vmax",
          width: "60vmax",
          height: "60vmax",
          background: `radial-gradient(circle at 30% 30%, ${blobs[0]}, transparent 60%)`,
          filter: "blur(60px) saturate(140%)",
          opacity: dark ? 0.45 : 0.35,
          animation: "auroraFloat1 26s ease-in-out infinite alternate",
          mixBlendMode: dark ? "screen" : "multiply",
          pointerEvents: "none"
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-25vmax",
          right: "-10vmax",
          width: "65vmax",
          height: "65vmax",
          background: `radial-gradient(circle at 60% 40%, ${blobs[1]}, transparent 60%)`,
          filter: "blur(70px) saturate(140%)",
          opacity: dark ? 0.4 : 0.34,
          animation: "auroraFloat2 32s ease-in-out infinite alternate",
          mixBlendMode: dark ? "screen" : "multiply",
          pointerEvents: "none"
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "10vmax",
          right: "10vmax",
          width: "50vmax",
          height: "50vmax",
          background: `radial-gradient(circle at 50% 50%, ${blobs[2]}, transparent 60%)`,
          filter: "blur(60px) saturate(140%)",
          opacity: dark ? 0.35 : 0.28,
          animation: "auroraFloat3 28s ease-in-out infinite alternate",
          mixBlendMode: dark ? "screen" : "multiply",
          pointerEvents: "none"
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: dark ? 0.08 : 0.06,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' " +
            "width='160' height='160' viewBox='0 0 40 40'%3E%3Cpath fill='%23fff' " +
            "fill-opacity='.9' d='M0 0h1v1H0z'/%3E%3C/svg%3E\")"
        }}
      />
    </Box>
  );
}