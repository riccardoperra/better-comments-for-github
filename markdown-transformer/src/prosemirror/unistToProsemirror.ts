import type {
  ContainerDirective,
  LeafDirective,
  TextDirective,
} from "mdast-util-directive";
import type { BlockContent, DefinitionContent, PhrasingContent } from "mdast";
import type { UnistNode } from "./types.js";
import type {
  MdxJsxAttribute,
  MdxJsxExpressionAttribute,
  MdxJsxFlowElement,
} from "mdast-util-mdx-jsx";
import type { Node, Node as ProseMirrorNode, Schema } from "prosemirror-model";

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
): UnistNode {
  const rootNode = convertNode(node, schema);
  if (rootNode.length !== 1) {
    throw new Error(
      "Couldn't find any way to convert the root ProseMirror node.",
    );
  }
  return rootNode[0];
}

export function toUnistDirective(
  node: Node,
  children: UnistNode[],
): LeafDirective | TextDirective | ContainerDirective {
  const nodeType = node.type;
  const name = node.type.spec.unistName
    ? node.type.spec.unistName.replace("directive:", "")
    : node.type.name;
  console.log(node, "parsing unist directive");
  if (nodeType.isInline) {
    return {
      type: "textDirective",
      name,
      attributes: node.attrs,
      // TODO: validation?
      children: nodeType.isLeaf ? [] : (children as PhrasingContent[]),
    };
  } else if (nodeType.isBlock) {
    if (nodeType.isAtom) {
      return {
        type: "leafDirective",
        name,
        attributes: node.attrs,
        children: [],
      };
    } else {
      return {
        type: "containerDirective",
        name,
        attributes: node.attrs,
        children: children as (BlockContent | DefinitionContent)[],
      };
    }
  } else {
    return {
      type: "leafDirective",
      name,
      attributes: node.attrs,
      children: children as PhrasingContent[],
    };
  }
}

export function toUnistJsxElement(
  tag: string,
  options: {
    attrs: Record<string, any>;
    children: any;
  },
): MdxJsxFlowElement {
  const attributes: (MdxJsxAttribute | MdxJsxExpressionAttribute)[] = [];
  for (const attr in options.attrs) {
    const value = options.attrs[attr];
    if (typeof value === "string") {
      attributes.push({
        type: "mdxJsxAttribute",
        name: attr,
        value,
      });
    } else {
      attributes.push({
        type: "mdxJsxAttribute",
        name: attr,
        value: {
          type: "mdxJsxAttributeValueExpression",
          value,
        },
      });
    }
  }
  return {
    type: "mdxJsxFlowElement",
    name: tag,
    attributes: attributes,
    children: options.children,
  };
}
