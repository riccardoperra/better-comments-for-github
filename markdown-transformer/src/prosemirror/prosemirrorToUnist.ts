import {
  type Attrs,
  type Node as ProsemirrorNode,
  type Schema,
} from "prosemirror-model";
import type { UnistNode } from "./types.js";
import type { Nodes, Root as MdastRoot } from "mdast";

import {
  fromMdastToProseMirror,
  type ToProseMirrorNodeHandler,
  type ToProseMirrorNodeHandlers,
} from "@prosemirror-processor/unist/mdast";

export function convertUnistToProsemirror(
  unistNode: UnistNode,
  schema: Schema,
  unknownHandler: ToProseMirrorNodeHandler<Nodes>,
): ProsemirrorNode {
  const defaultHandlers: ToProseMirrorNodeHandlers = {
    root(node, _, context) {
      const children = context.handleAll(node);
      return schema.topNodeType.create(null, children);
    },
    text(node) {
      return schema.text(String(node.value ?? ""));
    },
  };

  const nodeHandlers: ToProseMirrorNodeHandlers = {
    ...defaultHandlers,
  };

  schema.spec.marks.forEach((key, mark) => {
    if (mark.__fromUnist) {
      // @ts-expect-error for now ignore
      nodeHandlers[mark.unistName ?? key] = mark.__fromUnist!;
    }
  });

  schema.spec.nodes.forEach((key, node) => {
    if (node.__fromUnist) {
      // @ts-expect-error for now ignore
      nodeHandlers[node.unistName ?? key] = node.__fromUnist!;
    }
  });

  return fromMdastToProseMirror(unistNode as MdastRoot, {
    schema,
    nodeHandlers,
    unknownHandler: (unknownHandler as any) ?? undefined,
  })!;
}

/**
 * @deprecated Use @prosemirror-processor instead
 */
export function createProseMirrorNode(
  nodeName: string | null,
  schema: Schema<string, string>,
  children: ProsemirrorNode[],
  attrs: Attrs = {},
): ProsemirrorNode[] {
  if (nodeName === null) {
    return [];
  }
  const proseMirrorNode = schema.nodes[nodeName].createAndFill(attrs, children);
  if (proseMirrorNode === null) {
    return [];
  }
  return [proseMirrorNode];
}
