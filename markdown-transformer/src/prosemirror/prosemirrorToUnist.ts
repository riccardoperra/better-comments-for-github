import {
  type Attrs,
  type MarkSpec,
  type Node as ProsemirrorNode,
  type NodeSpec,
  type Schema,
} from "prosemirror-model";
import type { UnistNode } from "./types.js";
import type { Html, Root as MdastRoot } from "mdast";
import { DOMParser as ProseMirrorDOMParser } from "prosekit/pm/model";

import {
  type ToProseMirrorNodeHandlers,
  fromMdastToProseMirror,
} from "@prosemirror-processor/unist/mdast";

type SchemaMap = Record<string, MarkSpec | NodeSpec>;

export function convertUnistToProsemirror(
  unistNode: UnistNode,
  schema: Schema,
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
  })!;
}

function convertNode(
  unistNode: UnistNode,
  schema: Schema,
  map: SchemaMap,
  context: Partial<NonNullable<unknown>>,
) {
  let type = unistNode.type;

  if (type === "html") {
    const value = (unistNode as Html).value;
    if (globalThis.DOMParser) {
      const doc = new globalThis.DOMParser().parseFromString(
        value,
        "text/html",
      );
      const slice = ProseMirrorDOMParser.fromSchema(schema).parse(doc.body);
      console.dir(slice.content.toJSON(), { depth: null });
      return slice.content.content;
    }
  }

  const spec = map[type] as NodeSpec | MarkSpec | undefined;
  if (!spec || !spec.unistToNode) {
    console.warn(
      `Couldn't find any way to convert unist node of type "${type}" to a ProseMirror node.`,
    );
    return [];
  }
  const convertedChildren = [] as ProsemirrorNode[];
  if ("children" in unistNode && Array.isArray(unistNode.children)) {
    for (const child of unistNode.children as UnistNode[]) {
      convertedChildren.push(...convertNode(child, schema, map, context));
    }
  }
  return spec.unistToNode(unistNode, schema, convertedChildren, context);
}

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
