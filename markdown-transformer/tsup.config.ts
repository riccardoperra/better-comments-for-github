import { defineConfig } from "tsup";
import type { Options } from "tsup";

const config: Options[] = defineConfig([
  {
    name: "Transformer/Unified",
    clean: true,
    entry: ["./src/unified/index.ts"],
    outDir: "./dist/unified",
    dts: true,
    format: "esm",
  },
  {
    name: "Transformer/ProseMirror",
    clean: true,
    entry: ["./src/prosemirror/index.ts"],
    outDir: "./dist/prosemirror",
    dts: true,
    format: "esm",
  },
]) as Options[];

export default config;
