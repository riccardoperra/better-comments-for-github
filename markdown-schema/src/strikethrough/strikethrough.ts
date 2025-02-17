import { defineMarkSpec, union } from "prosekit/core";
import { defineStrike } from "prosekit/extensions/strike";
import type { Delete, PhrasingContent } from "mdast";

export function defineStrikethroughMarkdown() {
  return union(
    defineStrike(),
    defineMarkSpec({
      name: "strike",
      unistName: "delete",
      toUnist(node): Delete {
        return { type: "delete", children: [node] as PhrasingContent[] };
      },
      unistToNode(node, schema, children, context) {
        return children.map((child) =>
          child.mark(child.marks.concat(schema.marks.strike.create())),
        );
      },
    }),
  );
}
