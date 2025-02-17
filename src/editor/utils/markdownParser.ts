/*
 * Copyright 2025 Riccardo Perra
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
import { rehypeBlockquote } from './md/rehypeCustomBlockquote'
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
    .use(rehypeBlockquote)

    // Convert to ProseMirror with the remarkProseMirror plugin.
    // It takes the schema and a set of handlers, each of which
    // maps an mdast node type to a ProseMirror node (or nodes)
    .use(remarkProseMirror, {
      schema: schema,
      handlers: {
        blockquoteCallout(node, _, state) {
          const children = state.all(node)
          return schema.nodes.blockquote_callout.createChecked({}, children)
        },
        heading: toPmNode(schema.nodes.heading),
        blockquote: toPmNode(schema.nodes.blockquote),
        paragraph: toPmNode(schema.nodes.paragraph),
        listItem: toPmNode(schema.nodes.list_item),
        image: toPmNode(schema.nodes.image),
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
      image: fromPmNode('image'),
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
