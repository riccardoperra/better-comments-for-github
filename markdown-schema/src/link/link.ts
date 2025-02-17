import { defineMarkSpec, union } from "prosekit/core";
import { defineLink } from "prosekit/extensions/link";
import type { LinkAttrs } from "prosekit/extensions/link";
import type { Link, PhrasingContent } from "mdast";

export function defineLinkMarkdown() {
  return union(
    defineLink(),
    defineMarkSpec({
      name: "link",
      attrs: {
        title: {
          default: null,
        },
      },
      toUnist(node, mark): Link {
        const attrs = mark.attrs as LinkAttrs & { title?: string };
        return {
          type: "link",
          children: [node] as PhrasingContent[],
          url: attrs.href,
          title: attrs.title,
        };
      },
      unistToNode(node, schema, children, context) {
        const link = node as Link;
        return children.map((child) =>
          child.mark(
            child.marks.concat(
              schema.marks.link.create({
                href: link.url,
                title: link.title,
              }),
            ),
          ),
        );
      },
    }),
  );
}
