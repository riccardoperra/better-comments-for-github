import type { Root } from "mdast";
import { unistToMarkdown } from "@prosemirror-processor/markdown";

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
      // ruleSpaces: true,
      strong: "*",
    },
  });
}
