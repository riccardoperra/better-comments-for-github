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
import type { ImageAttrs } from 'prosekit/extensions/image'
import type { Image } from 'mdast'

export function defineImageMarkdown() {
  return union(
    defineImage(),
    defineNodeSpec({
      name: 'image',
      toUnist(node, children): Array<Image> {
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
