import { defineNodeSpec, union } from 'prosekit/core'
import { defineImage } from 'prosekit/extensions/image'
import { createProseMirrorNode } from 'prosemirror-transformer-markdown/prosemirror'
import type { ImageAttrs } from 'prosekit/extensions/image'
import type { Image } from 'mdast'

export function defineImageMarkdown() {
  return union(
    defineImage(),
    defineNodeSpec({
      name: 'image',
      toUnist(node, children): Image[] {
        const attrs = node.attrs as ImageAttrs
        return [
          {
            type: 'image',
            url: attrs.src as string,
            ...(node.attrs['alt'] !== null && {
              alt: node.attrs['alt'] as string,
            }),
            ...(node.attrs['title'] !== null && {
              title: node.attrs['title'] as string,
            }),
          },
        ]
      },
      unistToNode(node, schema, children, context) {
        const image = node as Image
        return createProseMirrorNode('image', schema, children, {
          src: image.url,
        } satisfies ImageAttrs)
      },
    }),
  )
}
