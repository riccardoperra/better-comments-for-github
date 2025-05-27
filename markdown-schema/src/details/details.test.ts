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
import { defineBlockquoteMarkdown } from '../blockquote/blockquote'
import { defineDetailsMarkdown } from './details'
import { remarkDetails } from './remarkDetails'

const extension = getNodesBaseExtensions([
  defineDetailsMarkdown(),
  defineBlockquoteMarkdown(),
])

const { doc, p, details, detailsSummary, blockquote } = builders(
  extension.schema!,
  {
    p: { nodeType: 'paragraph' },
  },
)

test('markdown -> prosemirror', () => {
  const editor = getEditorInstance(extension)
  const unist = markdownToUnist(
    `<details><summary>This is just a summary</summary><p>My summary content</p><blockquote>A quote text</blockquote></details>`,
    { transformers: [remarkDetails] },
  )

  const result = convertUnistToProsemirror(
    unist,
    editor.schema,
    testUnknownHandler,
  )

  const expected = doc(
    details(
      detailsSummary('This is just a summary'),
      p('My summary content'),
      blockquote(p('A quote text')),
    ),
  )

  sameNode(result, expected)
})

test('markdown -> prosemirror (empty summary)', () => {
  const editor = getEditorInstance(extension)
  const unist = markdownToUnist(
    `<details><p>My summary content</p></details>`,
    { transformers: [remarkDetails] },
  )

  const result = convertUnistToProsemirror(
    unist,
    editor.schema,
    testUnknownHandler,
  )

  const expected = doc(
    details(detailsSummary('Details'), p('My summary content')),
  )

  sameNode(result, expected)
})

test('prosemirror -> markdown', () => {
  const editor = getEditorInstance(
    extension,
    doc(
      details(
        detailsSummary('This is just a summary'),
        p('My summary content'),
        blockquote(p('A quote text')),
      ),
    ),
  )

  const result = convertPmSchemaToUnist(editor.state.doc, editor.schema)

  sameMarkdown(
    result,
    `<details><summary>This is just a summary</summary><p>My summary content</p><blockquote><p>A quote text</p></blockquote></details>`,
  )
})
