import { defineMarkSpec, defineNodeSpec, union } from "prosekit/core";
import { defineItalic } from "prosekit/extensions/italic";
import type { Emphasis, Strong, Text } from "mdast";

export function defineItalicMarkdown() {
  return union(
    defineItalic(),
    defineMarkSpec({
      name: "italic",
      unistName: "emphasis",
      toUnist(node): Emphasis {
        return { type: "emphasis", children: [node] as (Strong | Text)[] };
      },
      unistToNode(node, schema, children, context) {
        return children.map((child) =>
          child.mark(child.marks.concat(schema.marks.italic.create())),
        );
      },
    }),
  );
}
