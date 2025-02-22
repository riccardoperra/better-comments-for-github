import type { Root } from "mdast";
import type { UnistNode } from "./types.js";
import type { Node as ProseMirrorNode, Schema } from "prosemirror-model";

function convertNode(node: ProseMirrorNode, schema: Schema) {
  let convertedNodes: UnistNode[] | null = null;
  let convertedChildren: UnistNode[] = [];
  for (let i = 0; i < node.childCount; ++i) {
    const child = node.child(i);
    convertedChildren = convertedChildren.concat(convertNode(child, schema));
  }

  if (node.type.spec.toUnist) {
    convertedNodes = node.type.spec.toUnist(node, convertedChildren, schema);
  }

  if (convertedNodes === null) {
    console.warn(
      `Couldn't find any way to convert ProseMirror node of type "${node.type.name}" to a unist node.`,
    );
    return [];
  }

  return convertedNodes.map((convertedNode) => {
    let postProcessedNode = convertedNode;
    for (const mark of node.marks) {
      let processed = false;
      if (mark.type.spec.toUnist) {
        postProcessedNode = mark.type.spec.toUnist(
          postProcessedNode,
          mark,
          schema,
        );
        processed = true;
      }
      if (!processed) {
        console.warn(
          `Couldn't find any way to convert ProseMirror mark of type "${mark.type.name}" to a unist node.`,
        );
      }
    }
    return postProcessedNode;
  });
}

export function convertPmSchemaToUnist(
  node: ProseMirrorNode,
  schema: Schema,
  options?: Partial<{ postProcess: (node: Root) => void }>,
): UnistNode {
  const rootNode = convertNode(node, schema);
  if (rootNode.length !== 1) {
    throw new Error(
      "Couldn't find any way to convert the root ProseMirror node.",
    );
  }
  const result = rootNode[0];
  if (options?.postProcess) {
    options.postProcess(result as Root);
  }
  return result;
}
