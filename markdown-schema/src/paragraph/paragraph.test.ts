import { test } from 'vitest'
import { union } from 'prosekit/core'

import {
  convertPmSchemaToUnist,
  convertUnistToProsemirror,
} from 'prosemirror-transformer-markdown/prosemirror'
import { unistNodeFromMarkdown } from 'prosemirror-transformer-markdown/unified'
import { builders } from 'prosemirror-test-builder'
import {
  getEditorInstance,
  getNodesBaseExtensions,
  sameMarkdown,
  sameNode,
} from '../test-utils'
import { defineParagraphMarkdown } from './paragraph'

const extension = getNodesBaseExtensions([defineParagraphMarkdown()])

const { doc, p, quote } = builders(extension.schema!, {
  p: { nodeType: 'paragraph' },
})

test('markdown -> prosemirror', () => {
  const editor = getEditorInstance(extension)
  const unist = unistNodeFromMarkdown(`
    This is just a paragraph.
    
    This is the second paragraph.
  `)

  const result = convertUnistToProsemirror(unist, editor.schema)

  const expected = doc(
    p('This is just a paragraph.'),
    p('This is the second paragraph.'),
  )

  sameNode(result, expected)
})

test('prosemirror -> markdown', () => {
  const editor = getEditorInstance(
    extension,
    doc(p('This is just a paragraph.'), p('This is the second paragraph')),
  )

  const result = convertPmSchemaToUnist(editor.state.doc, editor.schema)

  sameMarkdown(
    result,
    'This is just a paragraph.\n\n' + 'This is the second paragraph',
  )
})
