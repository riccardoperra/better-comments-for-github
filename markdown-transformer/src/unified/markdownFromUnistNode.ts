import rehypeParse from "rehype-parse";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import type { Root } from "mdast";

export function markdownFromUnistNode(rootNode: Root): string {
  const processor = unified()
    .use(rehypeParse)
    .use(remarkGfm)
    .use(remarkStringify, {
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
    });

  return processor.stringify(rootNode);
}
