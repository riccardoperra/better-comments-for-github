import { defineMarkSpec, defineNodeSpec, union } from "prosekit/core";
import { defineCode } from "prosekit/extensions/code";
import type { InlineCode, Text } from "mdast";

export function defineCodeMarkdown() {
  return union(
    defineCode(),
    defineMarkSpec({
      name: "code",
      unistName: "inlineCode",
      toUnist(node, children): InlineCode {
        return { type: "inlineCode", value: (node as Text).value };
      },
      unistToNode(node, schema, children, context) {
        const code = node as InlineCode;
        return [schema.text(code.value).mark([schema.marks.code.create()])];
      },
    }),
  );
}
