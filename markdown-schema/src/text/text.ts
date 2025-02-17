import { defineNodeSpec, defineText, union } from "prosekit/core";
import type { Text } from "mdast";

export function defineTextMarkdown() {
  return union(
    defineText(),
    defineNodeSpec({
      name: "text",
      toUnist: (node, children): Text[] => [
        { type: "text", value: node.text ?? "" },
      ],
      unistToNode(node, schema, children, context) {
        const text = node as Text;
        return [schema.text(text.value)];
      },
    }),
  );
}
