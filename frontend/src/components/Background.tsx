import { Box } from "@mui/material";
import React from "react";

type Props = { mode: "light" | "dark" };

export default function Background({ mode }: Props) {
  const dark = mode === "dark";
  const base = dark ? "#0b0f15" : "#f6f8fb";

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        overflow: "hidden",
        background: dark
          ? "radial-gradient(60rem 60rem at 10% 10%, #1b2a4a 0%, transparent 60%)," +
            "radial-gradient(50rem 50rem at 90% 20%, #3b244a 0%, transparent 60%)," +
            "radial-gradient(60rem 60rem at 10% 90%, #13334c 0%, transparent 60%)," +
            "radial-gradient(60rem 60rem at 90% 90%, #2a3a4a 0%, transparent 60%)," +
            `linear-gradient(180deg, ${base} 0%, ${base} 100%)`
          : "radial-gradient(60rem 60rem at 20% 10%, #dbeafe 0%, transparent 60%)," +
            "radial-gradient(60rem 60rem at 80% 80%, #fde2e2 0%, transparent 60%)," +
            `linear-gradient(180deg, ${base} 0%, ${base} 100%)`
      }}
    >
      {/* Animated aurora blobs */}
      <Box
        sx={{
          position: "absolute",
          top: "-20vmax",
          left: "-10vmax",
          width: "60vmax",
          height: "60vmax",
          background:
            "radial-gradient(circle at 30% 30%, rgba(134,168,231,0.6), transparent 60%)",
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
          background:
            "radial-gradient(circle at 60% 40%, rgba(250,208,196,0.6), transparent 60%)",
          filter: "blur(70px) saturate(140%)",
          opacity: dark ? 0.40 : 0.34,
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
          background:
            "radial-gradient(circle at 50% 50%, rgba(145,234,228,0.6), transparent 60%)",
          filter: "blur(60px) saturate(140%)",
          opacity: dark ? 0.35 : 0.28,
          animation: "auroraFloat3 28s ease-in-out infinite alternate",
          mixBlendMode: dark ? "screen" : "multiply",
          pointerEvents: "none"
        }}
      />
      {/* Soft grain overlay */}
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