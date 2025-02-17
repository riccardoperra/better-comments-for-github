import { defineNodeSpec, union } from 'prosekit/core'
import {
  defineCodeBlockCommands,
  defineCodeBlockEnterRule,
  defineCodeBlockInputRule,
  defineCodeBlockKeymap,
  defineCodeBlockShiki,
  defineCodeBlockSpec,
} from 'prosekit/extensions/code-block'
import { createProseMirrorNode } from 'prosemirror-transformer-markdown/prosemirror'
import type { CodeBlockExtension } from 'prosekit/extensions/code-block'

import type { Code, Text } from 'mdast'

function defineCodeBlock(): CodeBlockExtension {
  return union(
    defineCodeBlockSpec(),
    defineCodeBlockInputRule(),
    defineCodeBlockEnterRule(),
    defineCodeBlockKeymap(),
    defineCodeBlockCommands(),
  )
}

export function defineCodeBlockMarkdown() {
  return union(
    defineCodeBlock(),
    defineCodeBlockShiki(),
    defineNodeSpec({
      name: 'codeBlock',
      unistName: 'code',
      toUnist(node, children): Code[] {
        return [
          {
            type: 'code',
            value: children
              .map((child) => (child as Text | undefined)?.value ?? '')
              .join(''),
            lang: node.attrs.language,
          },
        ]
      },
      unistToNode(node, schema, children, context) {
        const code = node as Code
        return createProseMirrorNode(
          'codeBlock',
          schema,
          [schema.text(code.value)],
          { language: code.lang },
        )
      },
    }),
  )
}
