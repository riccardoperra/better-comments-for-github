import { defineConfig } from "tsdown";
import type { UserConfig } from "tsdown";

const options: UserConfig[] = [
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
];

const config: UserConfig[] = defineConfig(options);

export default config;
