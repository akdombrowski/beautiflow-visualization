import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  let config = {};
  config.plugins = [react()];
  config.resolve = {
    alias: [
      {
        // this is required for the SCSS modules as it allows a leading ~
        find: /^~(.*)$/,
        replacement: "$1",
      },
    ],
  };
  
  if (command === "serve" || mode === "development") {
    config.server = { port: 3000 };
  }

  return config;
});
