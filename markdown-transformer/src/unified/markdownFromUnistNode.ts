import type { Root } from "mdast";
import { unistToMarkdown } from "@prosemirror-processor/markdown";
import { defaultHandlers } from "mdast-util-to-markdown";

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
      handlers: {
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
