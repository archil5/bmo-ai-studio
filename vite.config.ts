import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc"; // <-- This is the crucial fix

export default defineConfig({
  plugins: [react()],
  // Keep your base path for GitHub Pages
  base: "/bmo-ai-studio/", 
});
