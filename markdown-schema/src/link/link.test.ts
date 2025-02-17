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
import { defineLinkMarkdown } from './link'

const extension = getMarksBaseExtensions([defineLinkMarkdown()])

const { doc, p, link } = builders(extension.schema!, {
  p: { nodeType: 'paragraph' },
  link: { markType: 'link' },
})

test('(markdown -> prosemirror) Link with url', () => {
  const editor = getEditorInstance(extension)
  const unist = unistNodeFromMarkdown(`
    Just a [link](https://example.com) into content
  `)

  const result = convertUnistToProsemirror(unist, editor.schema)

  sameNode(
    result,
    doc(
      p(
        'Just a ',
        link({ href: 'https://example.com' }, 'link'),
        ' into content',
      ),
    ),
  )
})

test('(markdown -> prosemirror) Link with title', () => {
  const editor = getEditorInstance(extension)
  const unist = unistNodeFromMarkdown(`
    Just a [link](https://example.com "This is a title") into content
  `)

  const result = convertUnistToProsemirror(unist, editor.schema)

  sameNode(
    result,
    doc(
      p(
        'Just a ',
        link({ href: 'https://example.com', title: 'This is a title' }, 'link'),
        ' into content',
      ),
    ),
  )
})

test('(markdown -> prosemirror) Link with defined content', () => {
  const editor = getEditorInstance(extension)
  const unist = unistNodeFromMarkdown(`
    This is an example link: [https://example.com]
  `)

  const result = convertUnistToProsemirror(unist, editor.schema)

  sameNode(
    result,
    doc(
      p(
        'This is an example link: [',
        link({ href: 'https://example.com' }, 'https://example.com'),
        ']',
      ),
    ),
  )
})

test('prosemirror -> markdown', () => {
  const editor = getEditorInstance(
    extension,
    doc(
      p(
        'Click ',
        link({ title: 'Homepage', href: 'https://example.com' }, 'here'),
        ' to get started',
      ),
    ),
  )

  const result = convertPmSchemaToUnist(editor.state.doc, editor.schema)

  sameMarkdown(
    result,
    'Click [here](https://example.com "Homepage") to get started',
  )
})
