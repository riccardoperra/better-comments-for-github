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

import { defineNodeSpec, union } from 'prosekit/core'
import { defineTable } from 'prosekit/extensions/table'
import { createProseMirrorNode } from 'prosemirror-transformer-markdown/prosemirror'
import type {
  PhrasingContent,
  RowContent,
  Table,
  TableCell,
  TableContent,
  TableRow,
} from 'mdast'

export function defineTableMarkdown() {
  return union(
    defineTable(),
    defineNodeSpec({
      name: 'tableCell',
      toUnist(node, children): Array<TableCell> {
        return [
          {
            type: 'tableCell',
            children: children as Array<PhrasingContent>,
          },
        ]
      },
      unistName: 'tableCell',
      unistToNode(node, schema, children, context) {
        const mappedChildren = children.map((child) => {
          if (child.isText) {
            return createProseMirrorNode('paragraph', schema, [child])[0]
          }
          return child
        })
        return createProseMirrorNode('tableCell', schema, mappedChildren)
      },
    }),
    defineNodeSpec({
      name: 'tableRow',
      toUnist(node, children): Array<TableRow> {
        return [
          {
            type: 'tableRow',
            children: children as Array<RowContent>,
          },
        ]
      },
      unistName: 'tableRow',
      unistToNode(node, schema, children, context) {
        return createProseMirrorNode('tableRow', schema, children)
      },
    }),
    defineNodeSpec({
      name: 'table',
      toUnist(node, children): Array<Table> {
        return [
          {
            type: 'table',
            children: children as Array<TableContent>,
          },
        ]
      },
      unistName: 'table',
      unistToNode(node, schema, children, context) {
        // Fix heading
        const firstTableRow = children[0]
        const headers = [] as Array<any>
        const firstTableRowChildrenLenght = firstTableRow.childCount
        // TODO: fragment mapping
        for (let index = 0; index < firstTableRowChildrenLenght; index++) {
          const tableCell = firstTableRow.child(index)
          const tableHeaderCell = schema.nodes.tableHeaderCell.create(
            {},
            tableCell.content,
          )
          headers.push(tableHeaderCell)
        }
        children[0] = schema.nodes.tableRow.create({}, headers)
        return createProseMirrorNode('table', schema, children)
      },
    }),
    defineNodeSpec({
      name: 'tableHeaderCell',
      toUnist(node, children): Array<TableCell> {
        return [
          {
            type: 'tableCell',
            children: children as Array<PhrasingContent>,
          },
        ]
      },
      // unistName: "tableCell",
      unistToNode(node, schema, children, context) {
        return createProseMirrorNode('tableHeaderCell', schema, children)
      },
    }),
  )
}
