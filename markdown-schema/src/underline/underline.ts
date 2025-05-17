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
  canUseRegexLookbehind,
  defineCommands,
  defineKeymap,
  defineMarkSpec,
  toggleMark,
  union,
} from 'prosekit/core'
import { toHtml } from 'hast-util-to-html'
import { defineMarkInputRule } from 'prosekit/extensions/input-rule'
import { toProseMirrorMark } from '@prosemirror-processor/unist/mdast'

export function defineUnderlineMarkdown() {
  return union(
    defineMarkSpec({
      name: 'underline',
      unistName: 'underline',

      parseDOM: [{ tag: 'ins' }, { tag: 'u' }],
      toDOM: () => ['ins', {}, 0],

      __toUnist: (mark, parent, nodes, context) => {
        return {
          type: 'html',
          value: toHtml({
            type: 'element',
            tagName: 'ins',
            properties: {},
            // @ts-expect-error TODO: fix hast type
            children: nodes,
          }),
        }
      },
      __fromUnist: toProseMirrorMark('underline'),
    }),
    defineCommands({
      toggleUnderline: () => toggleMark({ type: 'underline' }),
    }),
    defineMarkInputRule({
      regex: canUseRegexLookbehind()
        ? /(?<=\s|^)<ins>([^\s<]|[^\s<][^<]*[^\s<])<\/ins>$/
        : /<ins>([^\s<]|[^\s<][^<]*[^\s<])<\/ins>$/,
      type: 'underline',
    }),
    defineKeymap({
      'mod-u': toggleMark({ type: 'underline' }),
    }),
  )
}

export { remarkUnderline } from './remarkUnderline'
