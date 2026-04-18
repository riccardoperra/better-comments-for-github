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

import { defineMathMarkdown } from '@prosedoc/markdown-schema'
import { union, defineNodeView, definePlugin } from 'prosekit/core'
import { defineInputRule } from 'prosekit/extensions/input-rule'
import { createEnterRulePlugin } from 'prosemirror-enter-rules'
import {
  createCursorInsidePlugin,
  createMathBlockView,
  createMathInlineInputRule,
  createMathInlineView,
  mathBlockEnterRule,
  renderKaTeXMathBlock,
  renderKaTeXMathInline,
} from 'prosemirror-math'

export function defineMath() {
  return union(
    defineMathMarkdown(),
    defineInputRule(createMathInlineInputRule('mathInline')),
    definePlugin(createEnterRulePlugin({ rules: [mathBlockEnterRule] })),
    definePlugin(createCursorInsidePlugin()),
    defineNodeView({
      name: 'mathBlock',
      constructor: (node, view, getPos, decorations) => {
        return createMathBlockView(
          renderKaTeXMathBlock,
          node,
          decorations ?? [],
        )
      },
    }),
    defineNodeView({
      name: 'mathInline',
      constructor: (node, view, getPos, decorations) => {
        return createMathInlineView(
          renderKaTeXMathInline,
          node,
          decorations ?? [],
        )
      },
    }),
  )
}
