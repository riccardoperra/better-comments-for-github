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
      toUnist(node, children): TableCell[] {
        return [
          {
            type: 'tableCell',
            children: children as PhrasingContent[],
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
      toUnist(node, children): TableRow[] {
        return [
          {
            type: 'tableRow',
            children: children as RowContent[],
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
      toUnist(node, children): Table[] {
        return [
          {
            type: 'table',
            children: children as TableContent[],
          },
        ]
      },
      unistName: 'table',
      unistToNode(node, schema, children, context) {
        // Fix heading
        const firstTableRow = children[0]
        const headers = [] as any[]
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
      toUnist(node, children): TableCell[] {
        return [
          {
            type: 'tableCell',
            children: children as PhrasingContent[],
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
