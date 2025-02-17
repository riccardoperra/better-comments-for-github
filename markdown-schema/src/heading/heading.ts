import { defineNodeSpec, union } from 'prosekit/core'
import { defineHeading } from 'prosekit/extensions/heading'
import { createProseMirrorNode } from 'prosemirror-transformer-markdown/prosemirror'
import type { HeadingAttrs } from 'prosekit/extensions/heading'
import type { Heading, PhrasingContent } from 'mdast'

export function defineHeadingMarkdown() {
  return union(
    defineHeading(),
    defineNodeSpec({
      name: 'heading',
      toUnist: (node, children): Heading[] => [
        {
          type: 'heading',
          children: children as PhrasingContent[],
          depth: node.attrs.level,
        },
      ],
      unistToNode(node, schema, children, context) {
        const heading = node as Heading
        return createProseMirrorNode('heading', schema, children, {
          level: heading.depth,
        } satisfies HeadingAttrs)
      },
    }),
  )
}
