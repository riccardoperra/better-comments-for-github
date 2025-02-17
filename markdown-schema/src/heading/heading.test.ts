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
import { defineHeadingMarkdown } from './heading'

const extension = getNodesBaseExtensions([defineHeadingMarkdown()])

const { doc, p, h1, h2, h3, h4, h5, h6 } = builders(extension.schema!, {
  p: { nodeType: 'paragraph' },
  h1: { nodeType: 'heading', level: 1 },
  h2: { nodeType: 'heading', level: 2 },
  h3: { nodeType: 'heading', level: 3 },
  h4: { nodeType: 'heading', level: 4 },
  h5: { nodeType: 'heading', level: 5 },
  h6: { nodeType: 'heading', level: 6 },
})

test('markdown -> prosemirror', () => {
  const editor = getEditorInstance(extension)
  const unist = unistNodeFromMarkdown(`
    # Heading 1
    
    ## Heading 2
    
    ### Heading 3
    
    #### Heading 4
    
    #### Heading 5
    
    ##### Heading 6    
  `)

  const result = convertUnistToProsemirror(unist, editor.schema)

  const expected = doc(
    h1('Heading 1'),
    h2('Heading 2'),
    h3('Heading 3'),
    h4('Heading 4'),
    h5('Heading 5'),
    h6('Heading 6'),
  )

  sameNode(result, expected)
})

test('prosemirror -> markdown', () => {
  const editor = getEditorInstance(
    extension,
    doc(
      h1('Heading 1'),
      h2('Heading 2'),
      h3('Heading 3'),
      h4('Heading 4'),
      h5('Heading 5'),
      h6('Heading 6'),
    ),
  )

  const result = convertPmSchemaToUnist(editor.state.doc, editor.schema)

  sameMarkdown(
    result,
    '# Heading 1\n\n' +
      '## Heading 2\n\n' +
      '### Heading 3\n\n' +
      '#### Heading 4\n\n' +
      '##### Heading 5\n\n' +
      '###### Heading 6',
  )
})
