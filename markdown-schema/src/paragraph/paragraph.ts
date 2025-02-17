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
