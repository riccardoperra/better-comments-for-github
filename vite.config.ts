import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json" with { type: "json" };

export default defineConfig({
  plugins: [solidPlugin(), crx({ manifest })],
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
  },
});
