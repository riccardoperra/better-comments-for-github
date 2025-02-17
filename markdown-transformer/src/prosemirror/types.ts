import type { Node as $UnistNode } from "unist";
import type { Node as $ProseMirrorNode, Mark, Schema } from "prosemirror-model";

export type UnistNode = $UnistNode;
export type ProseMirrorNode = $ProseMirrorNode;

declare module "prosemirror-model" {
  interface NodeSpec {
    unistName?: string;
    unistToNode?: (
      node: UnistNode,
      schema: Schema<string, string>,
      children: ProseMirrorNode[],
      context: Record<string, unknown>,
    ) => ProseMirrorNode[];

    toUnist?: (
      node: ProseMirrorNode,
      children: UnistNode[],
      schema: Schema<string, string>,
    ) => UnistNode[];
  }

  interface MarkSpec {
    unistName?: string;
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
