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
import { defineLinkMarkdown } from './link'

const extension = getMarksBaseExtensions([defineLinkMarkdown()])

console.log(extension.schema)
const { doc, p, link } = builders(extension.schema!, {
  p: { nodeType: 'paragraph' },
  link: { markType: 'link' },
})

test('(markdown -> prosemirror) Link with url', () => {
  const editor = getEditorInstance(extension)
  const unist = markdownToUnist(
    `Just a [link](https://example.com) into content`,
  )

  const result = convertUnistToProsemirror(
    unist,
    editor.schema,
    testUnknownHandler,
  )

  sameNode(
    result,
    doc(
      p(
        'Just a ',
        link({ href: 'https://example.com' }, 'link'),
        ' into content',
      ),
    ),
  )
})

test('(markdown -> prosemirror) Link with title', () => {
  const editor = getEditorInstance(extension)
  const unist = markdownToUnist(
    `Just a [link](https://example.com "This is a title") into content`,
  )

  const result = convertUnistToProsemirror(
    unist,
    editor.schema,
    testUnknownHandler,
  )

  sameNode(
    result,
    doc(
      p(
        'Just a ',
        link({ href: 'https://example.com', title: 'This is a title' }, 'link'),
        ' into content',
      ),
    ),
  )
})

test('(markdown -> prosemirror) Link with defined content', () => {
  const editor = getEditorInstance(extension)
  const unist = markdownToUnist(
    `This is an example link: [https://example.com]`,
  )

  const result = convertUnistToProsemirror(
    unist,
    editor.schema,
    testUnknownHandler,
  )

  sameNode(
    result,
    doc(
      p(
        'This is an example link: [',
        link({ href: 'https://example.com' }, 'https://example.com'),
        ']',
      ),
    ),
  )
})

test('prosemirror -> markdown', () => {
  const editor = getEditorInstance(
    extension,
    doc(
      p(
        'Click ',
        link({ title: 'Homepage', href: 'https://example.com' }, 'here'),
        ' to get started',
      ),
    ),
  )

  const result = convertPmSchemaToUnist(editor.state.doc, editor.schema)

  sameMarkdown(
    result,
    'Click [here](https://example.com "Homepage") to get started',
  )
})
