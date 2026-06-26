import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    allowedHosts: true,
    proxy: {
      "/api/v1/auctions": {
        target: "http://localhost:8084",
        changeOrigin: true,
      },
      "/api/v1/members/me": {
        target: "http://localhost:8084",
        changeOrigin: true,
      },
      "/ws": {
        target: "ws://localhost:8084",
        ws: true,
      },
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
})
