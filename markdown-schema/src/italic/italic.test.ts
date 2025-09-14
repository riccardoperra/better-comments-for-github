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
  getMarksBaseExtensions,
  sameMarkdown,
  sameNode,
  testUnknownHandler,
} from '../test-utils'
import { defineItalicMarkdown } from './italic'

const extension = getMarksBaseExtensions([defineItalicMarkdown()])

const { doc, p, em } = builders(extension.schema!, {
  p: { nodeType: 'paragraph' },
  em: { markType: 'italic' },
})

test('markdown -> prosemirror', () => {
  const editor = getEditorInstance(extension)
  const unist = markdownToUnist(`Just a test content *with italicized text*`)

  const result = convertUnistToProsemirror(
    unist,
    editor.schema,
    testUnknownHandler,
  )

  sameNode(result, doc(p('Just a test content ', em('with italicized text'))))
})

test('prosemirror -> markdown', () => {
  const editor = getEditorInstance(
    extension,
    doc(p('Just a test content ', em('with italicized text'))),
  )

  const result = convertPmSchemaToUnist(editor.state.doc, editor.schema)

  sameMarkdown(result, 'Just a test content *with italicized text*')
})
