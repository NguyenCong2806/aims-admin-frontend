import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Đọc cấu hình từ .env linh hoạt theo môi trường
  const env = loadEnv(mode, process.cwd(), "");
  const targetBackend = env.VITE_BACKEND_TARGET;

  return {
    plugins: [
      react(),
      svgr({
        svgrOptions: {
          icon: true,
          // This will transform your SVG to a React component
          exportType: "named",
          namedExport: "ReactComponent",
        },
      }),
    ],
    server: {
      proxy: {
        "/api": {
          target: targetBackend,
          changeOrigin: true,
          secure: false, // Bỏ qua cảnh báo SSL tự ký khi phát triển trên localhost
        },
      },
    },
  };
});
