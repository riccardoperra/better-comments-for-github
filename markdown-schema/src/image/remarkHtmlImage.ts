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

import { visit } from 'unist-util-visit'
import type { Image, Root } from 'mdast'

export const remarkHtmlImage = () => {
  return (root: Root) => {
    visit(root, 'html', (node, index, parent) => {
      const html = node.value
      const regex =
        /<img\s+[^>]*src="([^"]+)"(?:[^>]*alt="([^"]*)")?(?:[^>]*title="([^"]*)")?(?:[^>]*width="([^"]*)")?(?:[^>]*height="([^"]*)")?[^>]*>/i
      const match = html.match(regex)
      if (!match) {
        return
      }
      const meta = {
        src: match[1],
        alt: match[2],
        title: match[3],
        width: match[4],
        height: match[5],
      }

      if (parent && typeof index === 'number') {
        const image: Image = {
          type: 'image',
          alt: meta.alt,
          title: meta.title,
          url: meta.src,
          data: {
            hProperties: {
              width: meta.width ?? null,
              height: meta.height ?? null,
            },
          },
        }
        if (parent.type !== 'paragraph') {
          parent.children[index] = {
            type: 'paragraph',
            children: [image],
          }
        } else {
          parent.children[index] = image
        }
      }
    })
  }
}
