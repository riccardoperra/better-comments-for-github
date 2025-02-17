import { defineNodeSpec, union } from 'prosekit/core'
import { defineBlockquote } from 'prosekit/extensions/blockquote'
import { createProseMirrorNode } from 'prosemirror-transformer-markdown/prosemirror'
import type { BlockContent, Blockquote, DefinitionContent } from 'mdast'

export function defineBlockquoteMarkdown() {
  return union(
    defineBlockquote(),
    defineNodeSpec({
      name: 'blockquote',
      toUnist(node, children): Blockquote[] {
        return [
          {
            type: 'blockquote',
            children: children as (BlockContent | DefinitionContent)[],
          },
        ]
      },
      unistToNode(node, schema, children, context) {
        return createProseMirrorNode('blockquote', schema, children)
      },
    }),
  )
}
