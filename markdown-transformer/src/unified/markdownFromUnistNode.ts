import type { Root } from "mdast";
import { unistToMarkdown } from "@prosemirror-processor/markdown";
import { defaultHandlers } from "mdast-util-to-markdown";
import { mathToMarkdown } from "mdast-util-math";
import type { InlineMath, Math as BlockMath } from "mdast-util-math";

export function markdownFromUnistNode(rootNode: Root): string {
  return unistToMarkdown(rootNode, {
    stringifyOptions: {
      fences: true,
      listItemIndent: "one",
      resourceLink: true,
      bullet: "-",
      bulletOrdered: ".",
      emphasis: "*",
      incrementListMarker: true,
      rule: "-",
      strong: "*",
      extensions: [mathToMarkdown()],
      handlers: {
        inlineMath: (node) => `$${(node as InlineMath).value ?? ""}$`,
        math: (node) => {
          const value = (node as BlockMath).value ?? "";
          return ["$$", value, "$$"].join("\n");
        },
        break: (node, parent, state, info) => {
          if (parent && parent.type === "tableCell") {
            return "<br>";
          }
          return defaultHandlers.break(node, parent, state, info);
        },
      },
    },
  });
}
