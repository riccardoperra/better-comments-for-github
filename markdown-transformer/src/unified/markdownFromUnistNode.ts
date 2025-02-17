import rehypeParse from "rehype-parse";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import type { Root } from "mdast";
import remarkRehype from "remark-rehype";
import { visit } from "unist-util-visit";
import rehypeRaw from "rehype-raw";
import remarkMdx from "remark-mdx";

export function markdownFromUnistNode(rootNode: Root): string {
  const processor = unified()
    .use(rehypeParse)
    .use(remarkMdx, {})
    .use(remarkGfm)
    .use(() => {
      return (root) => {
        visit(root, "html-raw", (node) => {});
      };
    })
    .use(remarkGfm)

    .use(remarkStringify, {
      fences: true,
      listItemIndent: "one",
      resourceLink: true,
      rule: "-",
    });

  const processedNode = processor.runSync(rootNode);

  return processor.stringify(processedNode);
}
