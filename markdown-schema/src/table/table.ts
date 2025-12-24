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
import {
  defineTableCellSpec,
  defineTableCommands,
  defineTableDropIndicator,
  defineTableHeaderCellSpec,
  defineTableRowSpec,
  defineTableSpec,
} from 'prosekit/extensions/table'
import {
  fromProseMirrorNode,
  toProseMirrorNode,
} from '@prosemirror-processor/unist/mdast'
import { pmNode } from '@prosemirror-processor/unist'
import { tableEditing } from 'prosemirror-tables'
import { Fragment, Slice } from 'prosemirror-model'
import { Transform } from 'prosekit/pm/transform'
import type { Parent, PhrasingContent } from 'mdast'

export { remarkTableToHtmlOnComplexContent } from './remarkTableOutputHtml'

export function defineTableMarkdown() {
  return union(
    defineTableSpec(),
    defineTableRowSpec(),
    defineTableCellSpec(),
    defineTableHeaderCellSpec(),
    definePlugin([tableEditing()]),
    defineTableCommands(),
    defineTableDropIndicator(),
    defineNodeSpec({
      name: 'tableCell',
      __fromUnist: (node, parent, context) => {
        const isHead =
          !!parent &&
          parent.type === 'tableRow' &&
          node.type === 'tableCell' &&
          // TODO: should access to the parent of table row in my opinion
          parent.position?.start.line === 1 &&
          node.position?.start.line === 1
        const children = context.handleAll(node as Parent)
        const fragment = Fragment.from(children)

        const nodeType = isHead
          ? context.schema.nodes.tableHeaderCell
          : context.schema.nodes.tableCell

        if (nodeType.validContent(fragment)) {
          return pmNode(nodeType, fragment, null, { mode: 'fill' })
        }

        const cellNode = pmNode(nodeType, [], null, { mode: 'fill' })!
        // Fix https://github.com/riccardoperra/better-comments-for-github/issues/86
        // When the given fragment is not valid, instead of writing our-self the logic to match
        // the required content using contentMatch, we instead use pm transform with `fitter` logic
        // to automatically wrap the content into something that can be accepted by the cell content.
        // In most of the cases, this should create a paragraph that wraps the parsed children.
        const tr = new Transform(cellNode)
        tr.replace(1, 1, new Slice(fragment, 0, 0))
        return tr.doc
      },
      __toUnist: (node, parent, context) => {
        const { content } = node

        if (
          content.childCount === 1 &&
          content.child(0).type.name === 'paragraph'
        ) {
          const p = content.child(0)
          const childNodes = context.handleAll(p)
          return {
            type: 'tableCell',
            children: childNodes as unknown as Array<PhrasingContent>,
          } as const
        }

        return fromProseMirrorNode('tableCell')(node, parent, context as any)
      },
      unistName: 'tableCell',
    }),
    defineNodeSpec({
      name: 'tableRow',
      __fromUnist: toProseMirrorNode('tableRow'),
      // @ts-expect-error Fix types
      __toUnist: fromProseMirrorNode('tableRow'),
      unistName: 'tableRow',
    }),
    defineNodeSpec({
      name: 'table',
      __fromUnist: (arg0, arg1, arg2) => {
        return toProseMirrorNode('table')(arg0, arg1, arg2)
      },
      // @ts-expect-error Fix types
      __toUnist: fromProseMirrorNode('table'),
      unistName: 'table',
    }),
    defineNodeSpec({
      name: 'tableHeaderCell',
      __fromUnist: (arg0, arg1, arg2) => {
        return toProseMirrorNode('tableHeaderCell')(arg0, arg1, arg2)
      },
      // @ts-expect-error Fix types
      __toUnist: fromProseMirrorNode('tableHeaderCell'),
      unistName: 'tableHeaderCell',
    }),
  )
}
