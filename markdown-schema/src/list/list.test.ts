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
import { defineListMarkdown } from './list'
import { unistMergeAdjacentList } from './mergeAdjacentList'
import { remarkFlatList } from './remarkFlatList'

const extension = getMarksBaseExtensions([defineListMarkdown()])

const { doc, p, list } = builders(extension.schema!, {
  p: { nodeType: 'paragraph' },
  list: { nodeType: 'list' },
})

test('(markdown -> prosemirror) Bullet list', () => {
  const editor = getEditorInstance(extension)
  const unist = markdownToUnist(
    '- First item\n- Second item\n- Third item\n  - Nested item',
    {
      transformers: [remarkFlatList],
    },
  )

  const result = convertUnistToProsemirror(
    unist,
    editor.schema,
    testUnknownHandler,
  )

  sameNode(
    result,
    doc(
      list({ kind: 'bullet' }, p('First item')),
      list({ kind: 'bullet' }, p('Second item')),
      list(
        { kind: 'bullet' },
        p('Third item'),
        list({ kind: 'bullet' }, p('Nested item')),
      ),
    ),
  )
})

test('(markdown -> prosemirror) Ordered list', () => {
  const editor = getEditorInstance(extension)
  const unist = markdownToUnist(
    '1. First item\n2. Second item\n3. Third item\n   1. Nested item',
    {
      transformers: [remarkFlatList],
    },
  )

  const result = convertUnistToProsemirror(
    unist,
    editor.schema,
    testUnknownHandler,
  )

  sameNode(
    result,
    doc(
      list({ kind: 'ordered' }, p('First item')),
      list({ kind: 'ordered' }, p('Second item')),
      list(
        { kind: 'ordered' },
        p('Third item'),
        list({ kind: 'ordered' }, p('Nested item')),
      ),
    ),
  )
})

test('(markdown -> prosemirror) Task list', () => {
  const editor = getEditorInstance(extension)
  const unist = markdownToUnist(
    '- [ ] First item\n- [x] Second item\n- [ ] Third item\n  - [x] Nested item',
    {
      transformers: [remarkFlatList],
    },
  )

  const result = convertUnistToProsemirror(
    unist,
    editor.schema,
    testUnknownHandler,
  )

  sameNode(
    result,
    doc(
      list({ kind: 'task' }, p('First item')),
      list({ kind: 'task', checked: true }, p('Second item')),
      list(
        { kind: 'task' },
        p('Third item'),
        list({ kind: 'task', checked: true }, p('Nested item')),
      ),
    ),
  )
})

test('(prosemirror -> markdown) Bullet list', () => {
  const editor = getEditorInstance(
    extension,
    doc(
      list({ kind: 'bullet' }, p('First item')),
      list({ kind: 'bullet' }, p('Second item')),
      list(
        { kind: 'bullet' },
        p('Third item'),
        list({ kind: 'bullet' }, p('Nested item')),
      ),
    ),
  )

  const result = convertPmSchemaToUnist(editor.state.doc, editor.schema, {
    postProcess: unistMergeAdjacentList,
  })

  sameMarkdown(
    result,
    '- First item\n- Second item\n- Third item\n  - Nested item',
  )
})

test('(prosemirror -> markdown) Ordered list', () => {
  const editor = getEditorInstance(
    extension,
    doc(
      list({ kind: 'ordered' }, p('First item')),
      list({ kind: 'ordered' }, p('Second item')),
      list(
        { kind: 'ordered' },
        p('Third item'),
        list({ kind: 'ordered' }, p('Nested item')),
      ),
    ),
  )

  const result = convertPmSchemaToUnist(editor.state.doc, editor.schema, {
    postProcess: unistMergeAdjacentList,
  })

  sameMarkdown(
    result,
    '1. First item\n2. Second item\n3. Third item\n   1. Nested item',
  )
})

test('(prosemirror -> markdown) Task list', () => {
  const editor = getEditorInstance(
    extension,
    doc(
      list({ kind: 'task' }, p('First item')),
      list({ kind: 'task', checked: true }, p('Second item')),
      list(
        { kind: 'task' },
        p('Third item'),
        list({ kind: 'task', checked: true }, p('Nested item')),
      ),
    ),
  )

  const result = convertPmSchemaToUnist(editor.state.doc, editor.schema, {
    postProcess: unistMergeAdjacentList,
  })

  sameMarkdown(
    result,
    '- [ ] First item\n- [x] Second item\n- [ ] Third item\n  - [x] Nested item',
  )
})
