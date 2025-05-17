import type { Node as $UnistNode } from "unist";
import type { Mark, Node as $ProseMirrorNode, Schema } from "prosemirror-model";

import {
  type ProseMirrorMarkToMdastHandler,
  type ProseMirrorNodeToMdastHandler,
  type ToProseMirrorNodeHandler,
} from "@prosemirror-processor/unist/mdast";

import type * as Mdast from "mdast";

export type UnistNode = $UnistNode;
export type ProseMirrorNode = $ProseMirrorNode;

declare module "prosemirror-model" {
  interface NodeSpec {
    unistName?: string;
    __fromUnist?: ToProseMirrorNodeHandler<Mdast.Nodes>;
    __toUnist?: ProseMirrorNodeToMdastHandler<Mdast.Nodes, Mdast.Nodes>;
  }

  interface MarkSpec {
    unistName?: string;

    __fromUnist?: ToProseMirrorNodeHandler<Mdast.Nodes>;

    __toUnist?: ProseMirrorMarkToMdastHandler<Mdast.Nodes, Mdast.Nodes>;

    unistToNode?: (
      node: UnistNode,
      schema: Schema<string, string>,
      children: ProseMirrorNode[],
      context: Record<string, unknown>,
    ) => ProseMirrorNode[];
    toUnist?: (
      convertedNode: UnistNode,
      mark: Mark,
      schema: Schema<string, string>,
    ) => UnistNode;
  }
}
