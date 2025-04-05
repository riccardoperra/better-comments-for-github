import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import type { VFile, VFileCompatible } from "vfile";
import type { Node as UnistNode, Root } from "mdast";
import type { Options as RemarkParseOptions } from "remark-parse";

type RemarkHandler = (tree: Root, vfile: VFile) => void;
type TransformerRemarkHandler = (options?: Record<any, any>) => RemarkHandler;
type TransformerRemarkPlugin = {
  type: "remarkPlugin";
  handler: TransformerRemarkHandler;
};

export interface UnistNodeFromMarkdownOptions {
  vfile?: VFileCompatible;
  transformers?: TransformerRemarkPlugin[];
  remarkParseOptions?: RemarkParseOptions;
}

export function unistNodeFromMarkdown(
  content: string,
  options: UnistNodeFromMarkdownOptions = {},
): UnistNode {
  const { vfile, transformers, remarkParseOptions } = options;
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(
      (transformers ?? []).map((transformer) => {
        return function handler() {
          // @ts-expect-error fix
          return transformer.handler.call(this, {}); // Use call to keep context
        };
      }),
    );

  const parsed = processor.parse(content);
  return processor.runSync(parsed, vfile);
}
