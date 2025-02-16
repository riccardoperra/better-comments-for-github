import {
  fromPmMark,
  fromPmNode,
  fromProseMirror,
  remarkProseMirror,
  toPmMark,
  toPmNode,
} from '@handlewithcare/remark-prosemirror'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import remarkStringify from 'remark-stringify'
import type { RemarkProseMirrorOptions } from '@handlewithcare/remark-prosemirror'
import type { Node, Schema } from 'prosemirror-model'
import type { VFileWithOutput } from 'unified/lib'

export async function markdownToProseMirror(
  markdown: string,
  schema: Schema,
): Promise<VFileWithOutput<Node>> {
  const processor = unified()
    // Use remarkParse to parse the markdown string
    .use(remarkParse)
    // Convert to ProseMirror with the remarkProseMirror plugin.
    // It takes the schema and a set of handlers, each of which
    // maps an mdast node type to a ProseMirror node (or nodes)
    .use(remarkProseMirror, {
      schema: schema,
      handlers: {
        heading: toPmNode(schema.nodes.heading),
        blockquote: toPmNode(schema.nodes.blockquote),
        paragraph: toPmNode(schema.nodes.paragraph),
        listItem: toPmNode(schema.nodes.list_item),
        list(node, _, state) {
          const children = state.all(node)
          const nodeType = node.ordered
            ? schema.nodes.ordered_list
            : schema.nodes.bullet_list
          return nodeType.createAndFill({}, children)
        },

        emphasis: toPmMark(schema.marks.em),
        strong: toPmMark(schema.marks.strong),
        link: toPmMark(schema.marks.link, (node) => ({
          href: node.url,
          title: node.title,
        })),
      },
    } satisfies RemarkProseMirrorOptions)

  return processor.process(markdown)
}

export function proseMirrorToMarkdown(doc: Node, schema: Schema) {
  // Convert to mdast with the fromProseMirror util.
  // It takes a schema, a set of node handlers, and a
  // set of mark handlers, each of which converts a
  // ProseMirror node or mark to an mdast node.
  const mdast = fromProseMirror(doc, {
    schema: schema,
    nodeHandlers: {
      heading: fromPmNode('heading'),
      blockquote: fromPmNode('blockquote'),
      paragraph: fromPmNode('paragraph'),
      list_item: fromPmNode('listItem'),
      ordered_list: fromPmNode('list', () => ({
        ordered: true,
      })),
      bullet_list: fromPmNode('list', () => ({
        ordered: false,
      })),
    },
    markHandlers: {
      em: fromPmMark('emphasis'),
      strong: fromPmMark('strong'),
      link: fromPmMark('link', (mark) => ({
        url: mark.attrs['href'],
        title: mark.attrs['title'],
      })),
    },
  })

  return unified().use(remarkStringify).stringify(mdast)
}
