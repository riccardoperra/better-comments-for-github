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
import { defineCodeMarkdown } from './code'

const extension = getMarksBaseExtensions([defineCodeMarkdown()])

const { doc, p, code } = builders(extension.schema!, {
  p: { nodeType: 'paragraph' },
  code: { markType: 'code' },
})

test('markdown -> prosemirror', () => {
  const editor = getEditorInstance(extension)
  const unist = unistNodeFromMarkdown(`
    Just a test content \`with code text\`
  `)

  const result = convertUnistToProsemirror(unist, editor.schema)

  sameNode(result, doc(p('Just a test content ', code('with code text'))))
})

test('prosemirror -> markdown', () => {
  const editor = getEditorInstance(
    extension,
    doc(p('Just a test content ', code('with code text'))),
  )

  const result = convertPmSchemaToUnist(editor.state.doc, editor.schema)

  sameMarkdown(result, 'Just a test content `with code text`')
})
