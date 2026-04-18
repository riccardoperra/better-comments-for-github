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

import { test } from 'vitest'
import {
  convertPmSchemaToUnist,
  convertUnistToProsemirror,
} from 'prosemirror-transformer-markdown/prosemirror'
import { builders } from 'prosemirror-test-builder'
import { markdownToUnist } from '@prosemirror-processor/markdown'
import {
  getEditorInstance,
  getNodesBaseExtensions,
  sameMarkdown,
  sameNode,
  testUnknownHandler,
} from '../test-utils'
import { defineMathMarkdown, remarkMath } from './math'

const extension = getNodesBaseExtensions([defineMathMarkdown()])

const { doc, p, mathInline, mathBlock } = builders(extension.schema!, {
  p: { nodeType: 'paragraph' },
  mathInline: { nodeType: 'mathInline' },
  mathBlock: { nodeType: 'mathBlock' },
})

test('(markdown -> prosemirror) inline math', () => {
  const editor = getEditorInstance(extension)
  const unist = markdownToUnist('Inline $E = mc^2$ test', {
    transformers: [remarkMath],
  })

  const result = convertUnistToProsemirror(
    unist,
    editor.schema!,
    testUnknownHandler,
  )

  sameNode(result, doc(p('Inline ', mathInline('E = mc^2'), ' test')))
})

test('(markdown -> prosemirror) block math', () => {
  const editor = getEditorInstance(extension)
  const unist = markdownToUnist(
    [
      '$$',
      '\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}',
      '$$',
    ].join('\n'),
    { transformers: [remarkMath] },
  )

  const result = convertUnistToProsemirror(
    unist,
    editor.schema!,
    testUnknownHandler,
  )

  sameNode(
    result,
    doc(
      mathBlock(
        '\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}',
      ),
    ),
  )
})

test('(prosemirror -> markdown) inline and block math', () => {
  const editor = getEditorInstance(extension)
  const result = convertPmSchemaToUnist(
    doc(
      p('Inline ', mathInline('a^2 + b^2 = c^2'), ' done'),
      mathBlock('\\alpha + \\beta'),
    ),
    editor.schema!,
  )

  sameMarkdown(result, 'Inline $a^2 + b^2 = c^2$ done\n\n$$\n\\alpha + \\beta\n$$')
})
