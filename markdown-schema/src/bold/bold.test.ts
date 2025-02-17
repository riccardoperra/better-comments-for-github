import { assert, expect, test } from 'vitest'
import { createTestEditor } from 'prosekit/core/test'
import { Extension, union } from 'prosekit/core'
import { VFile } from 'vfile'

import {
  ProseMirrorNode,
  convertPmSchemaToUnist,
  convertUnistToProsemirror,
} from 'prosemirror-transformer-markdown/prosemirror'
import { unistNodeFromMarkdown } from 'prosemirror-transformer-markdown/unified'
import { builders } from 'prosemirror-test-builder'
import { defineDocMarkdown } from '../doc/doc'
import { defineTextMarkdown } from '../text/text'
import { defineParagraphMarkdown } from '../paragraph/paragraph'
import { getEditorInstance, sameMarkdown, sameNode } from '../test-utils'
import { defineBoldMarkdown } from './bold'

const extension = union(
  defineDocMarkdown(),
  defineBoldMarkdown(),
  defineTextMarkdown(),
  defineParagraphMarkdown(),
)

const { doc, p, strong } = builders(extension.schema!, {
  p: { nodeType: 'paragraph' },
  strong: { markType: 'bold' },
})

test('markdown -> prosemirror', () => {
  const editor = getEditorInstance(extension)
  const unist = unistNodeFromMarkdown(`
    Just a test content **with bold text**
  `)

  const result = convertUnistToProsemirror(unist, editor.schema)

  sameNode(result, doc(p('Just a test content ', strong('with bold text'))))
})

test('prosemirror -> markdown', () => {
  const editor = getEditorInstance(
    extension,
    doc(p('Just a test content ', strong('with bold text'))),
  )

  const result = convertPmSchemaToUnist(editor.state.doc, editor.schema)

  sameMarkdown(result, 'Just a test content **with bold text**')
})
