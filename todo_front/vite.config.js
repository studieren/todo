import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 1115, // 这里修改为你需要的端口号，比如8080
    strictPort: true, // 可选：如果端口被占用，会直接退出而不是自动切换端口
    proxy: {
      "/api/v1": {
        target: "http://localhost:1111/api/v1",
        changeOrigin: true,
        rewrite: (path) => path.replace("/api/v1", ""),
      },
    },
  },
});
