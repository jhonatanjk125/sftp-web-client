import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";

function httpsConfig() {
  const keyPath = path.resolve("certs/localhost-key.pem");
  const certPath = path.resolve("certs/localhost.pem");
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };
  }
  // As a fallback, let Vite try self-signed if supported by your setup
  // For best results, provide certs via mkcert.
  return true as unknown as { key: Buffer; cert: Buffer };
}

export default defineConfig({
  plugins: [react()],
  server: {
    // https: httpsConfig(), // Disabled for development
    port: 5173,
    strictPort: true,
    proxy: {
      // Proxy /api to FastAPI backend (adjust target if needed)
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false
      }
    }
  },
  preview: {
    https: httpsConfig(),
    port: 4173
  }
});