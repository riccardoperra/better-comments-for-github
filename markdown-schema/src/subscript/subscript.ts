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
import type { Html } from 'mdast'

export function defineSubscriptMarkdown() {
  return union(
    defineMarkSpec({
      name: 'subscript',
      unistName: 'subscript',

      parseDOM: [{ tag: 'sub' }],
      toDOM: () => ['sub', {}, 0],

      toUnist(node): Html {
        return {
          type: 'html',
          value: toHtml({
            type: 'element',
            tagName: 'sub',
            properties: {},
            children: [node as any],
          }),
        }
      },
      unistToNode(node, schema, children, context) {
        return children.map((child) =>
          child.mark(child.marks.concat(schema.marks.subscript.create())),
        )
      },
    }),
    defineCommands({
      toggleSubscript: () => toggleMark({ type: 'subscript' }),
    }),
    defineMarkInputRule({
      regex: canUseRegexLookbehind()
        ? /(?<=\s|^)<sub>([^\s<]|[^\s<][^<]*[^\s<])<\/sub>$/
        : /<sub>([^\s<]|[^\s<][^<]*[^\s<])<\/sub>$/,
      type: 'subscript',
    }),
    defineKeymap({
      'Mod-.': toggleMark({ type: 'subscript' }),
    }),
  )
}

export { remarkSubscript } from './remarkSubscript'
