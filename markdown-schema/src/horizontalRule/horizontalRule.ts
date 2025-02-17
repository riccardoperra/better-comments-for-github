import { defineNodeSpec, union } from 'prosekit/core'
import { defineHorizontalRule } from 'prosekit/extensions/horizontal-rule'
import { createProseMirrorNode } from 'prosemirror-transformer-markdown/prosemirror'
import type { ThematicBreak } from 'mdast'

export function defineHorizontalRuleMarkdown() {
  return union(
    defineHorizontalRule(),
    defineNodeSpec({
      name: 'horizontalRule',
      unistName: 'thematicBreak',
      toUnist(node, children): ThematicBreak[] {
        return [
          {
            type: 'thematicBreak',
          },
        ]
      },
      unistToNode(node, schema, children, context) {
        return createProseMirrorNode('horizontalRule', schema, children)
      },
    }),
  )
}
