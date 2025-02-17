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

import { markdownFromUnistNode } from 'prosemirror-transformer-markdown/unified'
import { union } from 'prosekit/core'
import { createTestEditor } from 'prosekit/core/test'
import { VFile } from 'vfile'
import { assert } from 'vitest'
import { defineDocMarkdown } from './doc/doc'
import { defineTextMarkdown } from './text/text'
import { defineParagraphMarkdown } from './paragraph/paragraph'
import type { Extension } from 'prosekit/core'
import type { Root } from 'mdast'
import type {
  ProseMirrorNode,
  UnistNode,
} from 'prosemirror-transformer-markdown/prosemirror'

export function sameNode(node: ProseMirrorNode, expected: ProseMirrorNode) {
  assert.equal(node.toString(), expected.toString())
}

export function sameMarkdown(result: UnistNode, expected: string) {
  const markdown = markdownFromUnistNode(result as Root, new VFile())
  assert.equal(markdown, expected + '\n')
}

export function getMarksBaseExtensions<
  const TExtension extends ReadonlyArray<Extension>,
>(extensions: TExtension) {
  return union(
    defineDocMarkdown(),
    defineTextMarkdown(),
    defineParagraphMarkdown(),
    ...extensions,
  )
}

export function getNodesBaseExtensions<
  const TExtension extends ReadonlyArray<Extension>,
>(extensions: TExtension) {
  return union(
    defineDocMarkdown(),
    ...extensions,
    defineTextMarkdown(),
    defineParagraphMarkdown(),
  )
}

export function getEditorInstance<TExtension extends Extension>(
  extension: TExtension,
  doc?: ProseMirrorNode,
) {
  const editor = createTestEditor({
    extension,
  })
  if (doc) {
    editor.set(doc)
  }
  return editor
}
