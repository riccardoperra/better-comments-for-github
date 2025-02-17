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
import { defineStrikethroughMarkdown } from './strikethrough'

const extension = getMarksBaseExtensions([defineStrikethroughMarkdown()])

const { doc, p, strike } = builders(extension.schema!, {
  p: { nodeType: 'paragraph' },
  strike: { markType: 'strike' },
})

test('markdown -> prosemirror', () => {
  const editor = getEditorInstance(extension)
  const unist = unistNodeFromMarkdown(`
    Just a test content with ~~deleted text~~
  `)

  const result = convertUnistToProsemirror(unist, editor.schema)

  sameNode(result, doc(p('Just a test content with ', strike('deleted text'))))
})

test('prosemirror -> markdown', () => {
  const editor = getEditorInstance(
    extension,
    doc(p('Just a test content with ', strike('deleted text'))),
  )

  const result = convertPmSchemaToUnist(editor.state.doc, editor.schema)

  sameMarkdown(result, 'Just a test content with ~~deleted text~~')
})
