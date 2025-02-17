import { defineDoc, defineNodeSpec, union } from 'prosekit/core'
import { createProseMirrorNode } from 'prosemirror-transformer-markdown/prosemirror'

export function defineDocMarkdown() {
  return union(
    defineDoc(),
    defineNodeSpec({
      name: 'doc',
      topNode: true,
      content: 'block+',
      unistName: 'root',
      toUnist: (node, children) => [{ children, type: 'root' }],
      unistToNode(node, schema, children, context) {
        return createProseMirrorNode('doc', schema, children)
      },
    }),
  )
}
