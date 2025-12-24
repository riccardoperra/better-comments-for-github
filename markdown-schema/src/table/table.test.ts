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
import {
  defineHardbreakMarkdown,
  remarkHtmlHardbreak,
} from '../hardbreak/hardbreak'
import { defineListMarkdown } from '../list/list'
import { defineTableMarkdown } from './table'

const extension = getMarksBaseExtensions([
  defineTableMarkdown(),
  defineHardbreakMarkdown(),
  defineListMarkdown(),
])

const { doc, p, table, tableHeaderCell, tableRow, tableCell, br } = builders(
  extension.schema!,
  {
    p: { nodeType: 'paragraph' },
    br: { nodeType: 'hardBreak' },
    table: { markType: 'table' },
    tableHeaderCell: { markType: 'tableHeaderCell' },
    tableRow: { markType: 'tableRow' },
    tableCell: { markType: 'tableCell' },
  },
)

test('markdown -> prosemirror', () => {
  const editor = getEditorInstance(extension)
  const unist = markdownToUnist(
    `| First Header | Second Header |
| ------------- | ------------- |
| Content Cell 1 | Content Cell 2 |
| Content Cell 3 | Content Cell 4 |`,
  )

  const result = convertUnistToProsemirror(
    unist,
    editor.schema,
    testUnknownHandler,
  )

  sameNode(
    result,
    doc(
      table(
        tableRow(
          tableHeaderCell(p('First Header')),
          tableHeaderCell(p('Second Header')),
        ),
        tableRow(
          tableCell(p('Content Cell 1')),
          tableCell(p('Content Cell 2')),
        ),
        tableRow(
          tableCell(p('Content Cell 3')),
          tableCell(p('Content Cell 4')),
        ),
      ),
    ),
  )
})

test('prosemirror -> markdown', () => {
  const editor = getEditorInstance(
    extension,
    doc(
      table(
        tableRow(
          tableHeaderCell(p('First Header')),
          tableHeaderCell(p('Second Header')),
        ),
        tableRow(
          tableCell(p('Content Cell 1')),
          tableCell(p('Content Cell 2')),
        ),
        tableRow(
          tableCell(p('Content Cell 3')),
          tableCell(p('Content Cell 4')),
        ),
      ),
    ),
  )

  const result = convertPmSchemaToUnist(editor.state.doc, editor.schema)

  sameMarkdown(
    result,
    `| First Header   | Second Header  |
| -------------- | -------------- |
| Content Cell 1 | Content Cell 2 |
| Content Cell 3 | Content Cell 4 |`,
  )
})

// https://github.com/riccardoperra/better-comments-for-github/issues/86
test('parse content with line breaks', () => {
  const editor = getEditorInstance(extension)

  const unist = markdownToUnist(
    `| Column 1 | Column 2 |
|--------|--------|
| This cell has a<br>line break in it | This cell does not |
| Still nothing in this cell | 1. This cell uses line breaks<br>2. to appear as a numbered list |
  `,
    {
      transformers: [remarkHtmlHardbreak],
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
      table(
        tableRow(
          tableHeaderCell(p('Column 1')),
          tableHeaderCell(p('Column 2')),
        ),
        tableRow(
          tableCell(p('This cell has a', br(), 'line break in it')),
          tableCell(p('This cell does not')),
        ),
        tableRow(
          tableCell(p('Still nothing in this cell')),
          tableCell(
            p(
              '1. This cell uses line breaks',
              br(),
              '2. to appear as a numbered list',
            ),
          ),
        ),
      ),
    ),
  )
})
