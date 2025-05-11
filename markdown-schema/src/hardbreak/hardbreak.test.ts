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
import { defineHardbreakMarkdown } from './hardbreak'
import { remarkHtmlHardbreak } from './remarkHtmlHardbreak'

const extension = getNodesBaseExtensions([defineHardbreakMarkdown()])

const { doc, p, hardbreak } = builders(extension.schema!, {
  p: { nodeType: 'paragraph' },
  hardbreak: { nodeType: 'hardBreak' },
})

test('markdown -> prosemirror (html tag)', () => {
  const editor = getEditorInstance(extension)
  const unist = markdownToUnist(
    `This is a text<br>This is a text with hardbreak`,
    { transformers: [remarkHtmlHardbreak] },
  )

  const result = convertUnistToProsemirror(unist, editor.schema)

  const expected = doc(
    p('This is a text', hardbreak(), 'This is a text with hardbreak'),
  )

  sameNode(result, expected)
})

test('markdown -> prosemirror (html tag)', () => {
  const editor = getEditorInstance(extension)
  const unist = markdownToUnist(
    `This is a text<br>This is a text with hardbreak`,
    { transformers: [remarkHtmlHardbreak] },
  )

  const result = convertUnistToProsemirror(unist, editor.schema)

  const expected = doc(
    p('This is a text', hardbreak(), 'This is a text with hardbreak'),
  )

  sameNode(result, expected)
})

test('prosemirror -> markdown', () => {
  const editor = getEditorInstance(
    extension,
    doc(p('This is a text', hardbreak(), 'This is a text with hardbreak')),
  )

  const result = convertPmSchemaToUnist(editor.state.doc, editor.schema)

  sameMarkdown(result, 'This is a text\\\nThis is a text with hardbreak')
})
