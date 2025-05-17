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
import { defineImageMarkdown, remarkHtmlImage } from './image'
import { remarkInlineImage } from './remarkInlineImage'

const extension = getNodesBaseExtensions([defineImageMarkdown()])

const { doc, p, image } = builders(extension.schema!, {
  p: { nodeType: 'paragraph' },
  image: { nodeType: 'image' },
})

test('markdown -> prosemirror', () => {
  const editor = getEditorInstance(extension)
  const unist = markdownToUnist(
    `![Alt text](https://placehold.co/600x400 "Title") with inline text`,
    {
      transformers: [remarkInlineImage, remarkHtmlImage],
    },
  )

  const result = convertUnistToProsemirror(unist, editor.schema)

  const expected = doc(
    p(
      image({
        src: 'https://placehold.co/600x400',
        alt: 'Alt text',
        title: 'Title',
      }),
      ' with inline text',
    ),
  )

  sameNode(result, expected)
})

test('markdown (with html) -> prosemirror', () => {
  const editor = getEditorInstance(extension)
  const unist = markdownToUnist(
    `<img src="https://placehold.co/600x400" alt="Alt text" title="My title" width="300" height="400">`,
    {
      transformers: [remarkInlineImage, remarkHtmlImage],
    },
  )

  const result = convertUnistToProsemirror(unist, editor.schema)

  const expected = doc(
    p(
      image({
        src: 'https://placehold.co/600x400',
        alt: 'Alt text',
        title: 'My title',
        width: '300',
        height: '400',
      }),
    ),
  )

  sameNode(result, expected)
})

test('prosemirror -> markdown (just markdown)', () => {
  const editor = getEditorInstance(
    extension,
    doc(
      p(
        image({
          src: 'https://placehold.co/600x400',
          alt: 'Alt text',
        }),
        ' inline text',
      ),
    ),
  )

  const result = convertPmSchemaToUnist(editor.state.doc, editor.schema)

  sameMarkdown(result, '![Alt text](https://placehold.co/600x400) inline text')
})

test('prosemirror -> markdown (convert to html since it contains custom width and height)', () => {
  const editor = getEditorInstance(
    extension,
    doc(
      p(
        image({
          src: 'https://placehold.co/600x400',
          alt: 'Alt text',
          width: 400,
          height: 300,
          title: 'My title',
        }),
        ' inline text',
      ),
    ),
  )

  const result = convertPmSchemaToUnist(editor.state.doc, editor.schema)

  sameMarkdown(
    result,
    '<img width="400" height="300" src="https://placehold.co/600x400" alt="Alt text"> inline text',
  )
})
