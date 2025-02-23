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
import { defineImage } from 'prosekit/extensions/image'
import { createProseMirrorNode } from 'prosemirror-transformer-markdown/prosemirror'
import { toHtml } from 'hast-util-to-html'
import type { ImageAttrs as $ImageAttrs } from 'prosekit/extensions/image'
import type { Image } from 'mdast'

export interface ImageAttrs extends $ImageAttrs {
  alt?: string | null
  title?: string | null
}

export function defineImageMarkdown() {
  return union(
    defineImage(),
    defineNodeSpec({
      name: 'image',
      attrs: {
        src: { default: null },
        alt: { default: null },
        width: { default: null },
        height: { default: null },
        title: { default: null },
      },
      inline: true,
      group: 'inline',
      defining: true,
      draggable: true,
      toUnist(node, children): Array<any> {
        const attrs = node.attrs as ImageAttrs
        if (attrs.width && attrs.height) {
          return [
            {
              type: 'html',
              value: toHtml({
                type: 'element',
                tagName: 'img',
                properties: {
                  width: Math.round(attrs.width),
                  height: Math.round(attrs.height),
                  src: attrs.src,
                  alt: attrs.alt,
                },
                children: children as any,
              }),
            },
          ]
        }
        return [
          {
            type: 'image',
            url: attrs.src as string,
            alt: node.attrs.alt ?? null,
            title: node.attrs.title ?? null,
          } satisfies Image,
        ]
      },
      unistToNode(node, schema, children, context) {
        const image = node as Image
        return createProseMirrorNode('image', schema, children, {
          src: image.url,
          alt: image.alt ?? null,
          title: image.title ?? null,
          // @ts-expect-error Why not present?
          width: image.data?.hProperties?.width,
          // @ts-expect-error Why not present?
          height: image.data?.hProperties.height,
        } satisfies ImageAttrs)
      },
    }),
  )
}

export { remarkHtmlImage } from './remarkHtmlImage'
export { remarkInlineImage } from './remarkInlineImage'
