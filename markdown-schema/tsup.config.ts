import { defineConfig } from "tsup";

export default defineConfig({
  name: "markdown-schema",
  clean: true,
  entry: ["./src/index.ts"],
  format: "esm",
  platform: "neutral",
  dts: true,
});
