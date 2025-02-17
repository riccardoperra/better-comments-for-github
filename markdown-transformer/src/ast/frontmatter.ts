import { matter } from "vfile-matter";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";
import type { Plugin } from "unified";

declare module "vfile" {
  interface DataMap {
    matterRaw: string;
  }
}

export const remarkExtractFrontMatter: Plugin = () => {
  return (root, file) => {
    matter(file);

    file.data.matterRaw = "";

    visit(root as Root, ["yaml"], (node, index, parent) => {
      file.data.matterRaw = (node as any).value;
      if (index !== undefined && parent && "children" in parent) {
        parent.children.splice(index, 1);
      }
    });
  };
};
