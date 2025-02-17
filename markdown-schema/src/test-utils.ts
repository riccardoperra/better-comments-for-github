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
  const TExtension extends readonly Extension[],
>(extensions: TExtension) {
  return union(
    defineDocMarkdown(),
    defineTextMarkdown(),
    defineParagraphMarkdown(),
    ...extensions,
  )
}

export function getNodesBaseExtensions<
  const TExtension extends readonly Extension[],
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
