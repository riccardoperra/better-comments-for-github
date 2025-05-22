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

import { defineNodeSpec, definePlugin, union } from 'prosekit/core'
import { DOMParser, DOMSerializer } from 'prosemirror-model'
import { pmNode } from '@prosemirror-processor/unist'
import { Plugin } from 'prosemirror-state'
import type { Schema } from 'prosemirror-model'
import type { Parent } from 'mdast'

export function defineDetailsMarkdown() {
  let schema: Schema
  return union(
    definePlugin(
      new Plugin({
        state: {
          init: (config, state) => {
            schema = state.schema
          },
        },
      }),
    ),
    defineNodeSpec({
      name: 'details',
      content: 'block+',
      marks: '',
      group: 'block',
      isolating: true,
      code: false,
      defining: true,
      unistName: 'details',
      __fromUnist: (node, parent, context) => {
        const [summary, content] = node.children

        const contentNode = new window.DOMParser().parseFromString(
          content.value,
          'text/html',
        )
        const pmContentNode = DOMParser.fromSchema(context.schema).parse(
          contentNode,
        )
        const pmSummaryNode = context.handle(
          summary,
          node as Parent,
        ) as unknown as Array<any>
        return pmNode(
          context.schema.nodes.details,
          [...pmSummaryNode, ...pmContentNode.children],
          {},
          { mode: 'fill' },
        )
      },
      __toUnist: (node, parent, context) => {
        return {
          type: 'html',
          value: `<details>${DOMSerializer.fromSchema(schema).serializeNode(node).innerHTML}</details>`,
        }
      },
      parseDOM: [
        {
          tag: 'details',
          getAttrs(dom) {
            return {
              open: (dom as HTMLDetailsElement).open,
            }
          },
        },
      ],
      toDOM(node) {
        const { open } = node.attrs
        return ['details', { open }, 0]
      },
    }),
    defineNodeSpec({
      name: 'detailsSummary',
      content: 'inline*',
      group: 'block detailsGroup',
      parseDOM: [{ tag: 'summary' }],
      unistName: 'detailsSummary',
      __toUnist: (pmNode, parent, context) => {
        const serializedNode =
          DOMSerializer.fromSchema(schema).serializeNode(pmNode)
        return {
          type: 'html',
          value: serializedNode.innerHTML,
        }
      },
      __fromUnist: (node, parent, context) => {
        const domNode = new window.DOMParser().parseFromString(
          node.value,
          'text/html',
        )

        return DOMParser.fromSchema(context.schema).parse(domNode, {
          topNode: context.schema.nodes.detailsSummary.create(),
        })
      },
      toDOM() {
        return ['summary', 0]
      },
    }),
  )
}
