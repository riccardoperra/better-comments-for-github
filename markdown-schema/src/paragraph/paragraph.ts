import {
  Priority,
  defineNodeSpec,
  defineParagraph,
  union,
  withPriority,
} from 'prosekit/core'
import { createProseMirrorNode } from 'prosemirror-transformer-markdown/prosemirror'
import { toHtml } from 'hast-util-to-html'
import type { Paragraph, PhrasingContent } from 'mdast'

export function defineParagraphMarkdown() {
  return withPriority(
    union(
      defineParagraph(),
      defineNodeSpec({
        name: 'paragraph',
        toUnist: (node, children): Array<Paragraph> => {
          if (node.attrs.textAlign && node.attrs.textAlign !== 'left') {
            return [
              {
                type: 'html',
                value: toHtml({
                  type: 'element',
                  tagName: 'p',
                  properties: {
                    align: node.attrs.textAlign,
                  },
                  children: children as any,
                }),
              } as any,
            ]
          }
          return [
            { type: 'paragraph', children: children as Array<PhrasingContent> },
          ]
        },
        unistToNode(node, schema, children, context) {
          return createProseMirrorNode('paragraph', schema, children)
        },
      }),
    ),
    Priority.highest,
  )
}
