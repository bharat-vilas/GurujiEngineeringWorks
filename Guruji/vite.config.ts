import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["axios"], // Exclude axios from optimization
  },
  server: {
    fs: {
      strict: false, // Allow vite to resolve dependencies more flexibly
    },
  },
});
