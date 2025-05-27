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
  defineCommands,
  defineNodeSpec,
  insertNode,
  union,
} from 'prosekit/core'
import { DOMParser, DOMSerializer } from 'prosemirror-model'
import { pmNode } from '@prosemirror-processor/unist'
import type { Parent } from 'mdast'

export { remarkDetails } from './remarkDetails'

export function defineDetailsMarkdown() {
  return union(
    defineCommands({
      insertDetails: () => {
        return (state, dispatch, view) => {
          const summary = pmNode(
            state.schema.nodes.detailsSummary,
            [state.schema.text('Summary')],
            null,
          )!

          const node = pmNode(
            state.schema.nodes.details,
            [summary, state.schema.nodes.paragraph.createAndFill(null)!],
            { open: true },
            {
              mode: 'fill',
            },
          )

          if (!node) {
            return false
          }

          const command = insertNode({
            node,
          })(state, dispatch, view)

          return command
        }
      },
    }),
    defineNodeSpec({
      name: 'details',
      content: 'detailsSummary block+',
      marks: '',
      group: 'block',
      isolating: true,
      unistName: 'details',
      code: true,
      defining: true,
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
          value: `<details>${DOMSerializer.fromSchema(context.schema).serializeNode(node).innerHTML}</details>`,
        }
      },
      attrs: {
        open: {
          default: true,
        },
      },
      parseDOM: [
        {
          tag: 'details',
          getAttrs(dom) {
            return {
              open: (dom as HTMLDetailsElement).getAttribute('open'),
            }
          },
        },
      ],
      toDOM(node) {
        const { open } = node.attrs
        const attrs = {} as Record<string, any>
        if (open) {
          attrs.open = true
        }

        return ['details', attrs, 0]
      },
    }),
    defineNodeSpec({
      name: 'detailsSummary',
      content: 'inline*',
      group: 'block detailsGroup',
      parseDOM: [{ tag: 'summary' }],
      unistName: 'detailsSummary',
      __toUnist: (pmNode, parent, context) => {
        const serializedNode = DOMSerializer.fromSchema(
          context.schema,
        ).serializeNode(pmNode)
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
