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
import { createProseMirrorNode } from 'prosemirror-transformer-markdown/prosemirror'
import {
  fromProseMirrorNode,
  toProseMirrorNode,
} from '@prosemirror-processor/unist/mdast'
import { pmNode } from '@prosemirror-processor/unist'
import { tableEditing } from 'prosemirror-tables'
import type { Parent } from 'mdast'

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
          // TODO: should access to the parent of table row in my opinion
          parent.position?.start.line === 1 &&
          node.position?.start.line === 1
        const children = context.handleAll(node as Parent)
        const mappedChildren = children.map((child) => {
          if (child.isText) {
            return createProseMirrorNode('paragraph', context.schema, [
              child,
            ])[0]
          }
          return child
        })
        const nodeType = isHead
          ? context.schema.nodes.tableHeaderCell
          : context.schema.nodes.tableCell
        return pmNode(nodeType, mappedChildren, null)
      },
      __toUnist: (node, parent, context) => {
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
