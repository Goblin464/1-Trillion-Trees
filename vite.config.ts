import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/1-Trillion-Trees/", // <--- wichtig, entspricht deinem Repo-Namen
  plugins: [react()],
});
