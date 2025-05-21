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
import { defineHardbreakMarkdown } from '../hardbreak/hardbreak'
import { remarkComment } from './remarkComment'
import { defineCommentMarkdown } from './comment'

const extension = getNodesBaseExtensions([
  defineCommentMarkdown(),
  defineHardbreakMarkdown(),
])

const { doc, p, comment, hardBreak } = builders(extension.schema!, {
  p: { nodeType: 'paragraph' },
  comment: { nodeType: 'comment' },
})

test('markdown -> prosemirror (html tag)', () => {
  const editor = getEditorInstance(extension)
  const unist = markdownToUnist(
    `This is just a text <!-- with inline comment -->

This is a multiline comment:
<!-- 
raw text into comment 
*a bold text* here
\`\`\`
a code block comment
\`\`\`
-->
`,
    { transformers: [remarkComment] },
  )

  const result = convertUnistToProsemirror(
    unist,
    editor.schema,
    testUnknownHandler,
  )

  const expected = doc(
    p('This is just a text ', comment(' with inline comment ')),
    p('This is a multiline comment:'),
    p(
      comment(
        ' ',
        hardBreak(),
        'raw text into comment ',
        hardBreak(),
        '*a bold text* here',
        hardBreak(),
        '```',
        hardBreak(),
        'a code block comment',
        hardBreak(),
        '```',
        hardBreak(),
      ),
    ),
  )

  sameNode(result, expected)
})

test('prosemirror -> markdown', () => {
  const editor = getEditorInstance(
    extension,
    doc(
      p('This is just a text ', comment(' with inline comment ')),
      p('This is a multiline comment:'),
      p(
        comment(
          ' ',
          hardBreak(),
          'raw text into comment ',
          hardBreak(),
          '*a bold text* here',
          hardBreak(),
          '```',
          hardBreak(),
          'a code block comment',
          hardBreak(),
          '```',
          hardBreak(),
        ),
      ),
    ),
  )

  const result = convertPmSchemaToUnist(editor.state.doc, editor.schema)

  sameMarkdown(
    result,
    `This is just a text <!-- with inline comment -->

This is a multiline comment:

<!-- 
raw text into comment 
*a bold text* here
\`\`\`
a code block comment
\`\`\`
-->`,
  )
})
