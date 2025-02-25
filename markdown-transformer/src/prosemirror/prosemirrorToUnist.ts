import {
  type Attrs,
  type MarkSpec,
  type Node as ProsemirrorNode,
  type NodeSpec,
  type Schema,
} from "prosemirror-model";
import type { UnistNode } from "./types.js";
import type { Html } from "mdast";
import { DOMParser as ProseMirrorDOMParser } from "prosekit/pm/model";

type SchemaMap = Record<string, MarkSpec | NodeSpec>;

export function convertUnistToProsemirror(
  unistNode: UnistNode,
  schema: Schema,
): ProsemirrorNode {
  const context: Partial<NonNullable<unknown>> = {};
  const schemaMap = {} as SchemaMap;
  schema.spec.marks.forEach((key, mark) => {
    schemaMap[mark.unistName ?? key] = mark;
  });
  schema.spec.nodes.forEach((key, node) => {
    schemaMap[node.unistName ?? key] = node;
  });
  const rootNode = convertNode(unistNode, schema, schemaMap, context);
  if (rootNode.length !== 1) {
    throw new Error("Couldn't find any way to convert the root unist node.");
  }
  return rootNode[0];
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
