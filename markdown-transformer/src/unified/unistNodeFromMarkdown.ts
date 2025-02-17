import remarkDirective from "remark-directive";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { remarkExtractFrontMatter } from "../ast/frontmatter.js";
import type { VFile, VFileCompatible } from "vfile";
import type { Node as UnistNode, Root } from "mdast";

type RemarkHandler = (tree: Root, vfile: VFile) => undefined;
type TransformerRemarkHandler = (options?: Record<any, any>) => RemarkHandler;
type TransformerRemarkPlugin = {
  type: "remarkPlugin";
  handler: TransformerRemarkHandler;
};

export interface UnistNodeFromMarkdownOptions {
  vfile?: VFileCompatible;
  transformers?: TransformerRemarkPlugin[];
}

export function unistNodeFromMarkdown(
  content: string,
  options: UnistNodeFromMarkdownOptions = {},
): UnistNode {
  const { vfile, transformers } = options;
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(
      (transformers ?? []).map((transformer) => () => transformer.handler({})),
    );

  const parsed = processor.parse(content);
  return processor.runSync(parsed, vfile);
}
