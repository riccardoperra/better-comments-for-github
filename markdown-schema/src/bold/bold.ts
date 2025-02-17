import { defineMarkSpec, defineNodeSpec, union } from "prosekit/core";
import { defineBold } from "prosekit/extensions/bold";
import type { PhrasingContent, Strong } from "mdast";

export function defineBoldMarkdown() {
  return union(
    defineBold(),
    defineMarkSpec({
      name: "bold",
      unistName: "strong",
      toUnist(node): Strong {
        return { type: "strong", children: [node] as PhrasingContent[] };
      },
      unistToNode(node, schema, children, context) {
        return children.map((child) =>
          child.mark(child.marks.concat(schema.marks.bold.create())),
        );
      },
    }),
  );
}
