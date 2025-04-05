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

export function defineSuperscriptMarkdown() {
  return union(
    defineMarkSpec({
      name: 'superscript',
      unistName: 'superscript',

      parseDOM: [{ tag: 'sup' }],
      toDOM: () => ['sup', {}, 0],

      __toUnist: (node, parent, children) => {
        return {
          type: 'html',
          value: toHtml({
            type: 'element',
            tagName: 'sup',
            properties: {},
            // @ts-expect-error TODO: fix types
            children,
          }),
        }
      },

      __fromUnist: toProseMirrorMark('superscript'),
    }),
    defineCommands({
      toggleSuperscript: () => toggleMark({ type: 'superscript' }),
    }),
    defineMarkInputRule({
      regex: canUseRegexLookbehind()
        ? /(?<=\s|^)<sup>([^\s<]|[^\s<][^<]*[^\s<])<\/sup>$/
        : /<sup>([^\s<]|[^\s<][^<]*[^\s<])<\/sup>$/,
      type: 'superscript',
    }),
    defineKeymap({
      'mod-.': toggleMark({ type: 'superscript' }),
    }),
  )
}

export { remarkSuperscript } from './remarkSuperscript'
