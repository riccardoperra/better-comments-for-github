import { test } from 'vitest'

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
import { defineBlockquoteMarkdown } from './blockquote'

const extension = getNodesBaseExtensions([defineBlockquoteMarkdown()])

const { doc, p, quote } = builders(extension.schema!, {
  p: { nodeType: 'paragraph' },
  quote: { nodeType: 'blockquote' },
})

test('markdown -> prosemirror', () => {
  const editor = getEditorInstance(extension)
  const unist = unistNodeFromMarkdown(`
    This is just a paragraph.
    > Here a quote.
    > This is a second line quote
    >
    > A line after a break
  `)

  const result = convertUnistToProsemirror(unist, editor.schema)

  const expected = doc(
    p('This is just a paragraph.'),
    quote(
      p('Here a quote.\nThis is a second line quote'),
      p('A line after a break'),
    ),
  )

  sameNode(result, expected)
})

test('(markdown -> prosemirror) Nested ', () => {
  const editor = getEditorInstance(extension)
  const unist = unistNodeFromMarkdown(`
    This is just a paragraph.
    > Here a quote.
    >
    >> This is a nested blockquote.
    >> This is a nested blockquote second line
  `)

  const result = convertUnistToProsemirror(unist, editor.schema)

  const expected = doc(
    p('This is just a paragraph.'),
    quote(
      p('Here a quote.'),
      quote(
        p(
          'This is a nested blockquote.\nThis is a nested blockquote second line',
        ),
      ),
    ),
  )

  sameNode(result, expected)
})

test('prosemirror -> markdown', () => {
  const editor = getEditorInstance(
    extension,
    doc(
      p('This is just a paragraph.'),
      quote(
        p('Here a quote.\nThis is a second line quote'),
        p('A line after a break'),
      ),
    ),
  )

  const result = convertPmSchemaToUnist(editor.state.doc, editor.schema)

  sameMarkdown(
    result,
    'This is just a paragraph.\n\n' +
      '> Here a quote.\n' +
      '> This is a second line quote\n' +
      '>\n' +
      '> A line after a break',
  )
})
