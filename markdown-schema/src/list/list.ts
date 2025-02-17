import { defineNodeSpec, union } from "prosekit/core";
import { defineList } from "prosekit/extensions/list";

// TODO: check prosemirror-flatlist impl
export function defineListMarkdown() {
  return union(
    defineList(),
    defineNodeSpec({
      name: "list",
      //   toUnist(node, children): List[] {
      //     return [
      //       {
      //         type: "list",
      //         ordered: node.attrs.kind,
      //       },
      //     ];
      //   },
    }),
  );
}
