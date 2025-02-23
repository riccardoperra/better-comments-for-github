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
import { unistNodeFromMarkdown } from 'prosemirror-transformer-markdown/unified'
import { builders } from 'prosemirror-test-builder'
import {
  getEditorInstance,
  getMarksBaseExtensions,
  sameMarkdown,
  sameNode,
} from '../test-utils'
import { defineStrikethroughMarkdown } from './strikethrough'

const extension = getMarksBaseExtensions([defineStrikethroughMarkdown()])

const { doc, p, strike } = builders(extension.schema!, {
  p: { nodeType: 'paragraph' },
  strike: { markType: 'strike' },
})

test('markdown -> prosemirror', () => {
  const editor = getEditorInstance(extension)
  const unist = unistNodeFromMarkdown(
    `Just a test content with ~~deleted text~~`,
  )

  const result = convertUnistToProsemirror(unist, editor.schema)

  sameNode(result, doc(p('Just a test content with ', strike('deleted text'))))
})

test('prosemirror -> markdown', () => {
  const editor = getEditorInstance(
    extension,
    doc(p('Just a test content with ', strike('deleted text'))),
  )

  const result = convertPmSchemaToUnist(editor.state.doc, editor.schema)

  sameMarkdown(result, 'Just a test content with ~~deleted text~~')
})
