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
} from '../test-utils'
import { defineBlockquoteMarkdown } from './blockquote'

const extension = getNodesBaseExtensions([defineBlockquoteMarkdown()])

const { doc, p, quote } = builders(extension.schema!, {
  p: { nodeType: 'paragraph' },
  quote: { nodeType: 'blockquote' },
})

test('markdown -> prosemirror', () => {
  const editor = getEditorInstance(extension)
  const unist = markdownToUnist(`This is just a paragraph.
> Here a quote.
> This is a second line quote
>
> A line after a break`)

  const result = convertUnistToProsemirror(unist, editor.schema)

  const expected = doc(
    p('This is just a paragraph.'),
    quote(
      p('Here a quote.\nThis is a second line quote'),
      p('A line after a break'),
    ),
  )

  sameNode(result, expected)
})

test('(markdown -> prosemirror) Nested ', () => {
  const editor = getEditorInstance(extension)
  const unist = markdownToUnist(`This is just a paragraph.
> Here a quote.
>
>> This is a nested blockquote.
>> This is a nested blockquote second line`)

  const result = convertUnistToProsemirror(unist, editor.schema)

  const expected = doc(
    p('This is just a paragraph.'),
    quote(
      p('Here a quote.'),
      quote(
        p(
          'This is a nested blockquote.\nThis is a nested blockquote second line',
        ),
      ),
    ),
  )

  sameNode(result, expected)
})

test('prosemirror -> markdown', () => {
  const editor = getEditorInstance(
    extension,
    doc(
      p('This is just a paragraph.'),
      quote(
        p('Here a quote.\nThis is a second line quote'),
        p('A line after a break'),
      ),
    ),
  )

  const result = convertPmSchemaToUnist(editor.state.doc, editor.schema)

  sameMarkdown(
    result,
    'This is just a paragraph.\n\n' +
      '> Here a quote.\n' +
      '> This is a second line quote\n' +
      '>\n' +
      '> A line after a break',
  )
})
