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
import { defineItalicMarkdown } from './italic'

const extension = getMarksBaseExtensions([defineItalicMarkdown()])

const { doc, p, em } = builders(extension.schema!, {
  p: { nodeType: 'paragraph' },
  em: { markType: 'italic' },
})

test('markdown -> prosemirror', () => {
  const editor = getEditorInstance(extension)
  const unist = unistNodeFromMarkdown(`
    Just a test content *with italicized text*
  `)

  const result = convertUnistToProsemirror(unist, editor.schema)

  sameNode(result, doc(p('Just a test content ', em('with italicized text'))))
})

test('prosemirror -> markdown', () => {
  const editor = getEditorInstance(
    extension,
    doc(p('Just a test content ', em('with italicized text'))),
  )

  const result = convertPmSchemaToUnist(editor.state.doc, editor.schema)

  sameMarkdown(result, 'Just a test content *with italicized text*')
})
