/*
 * Copyright 2025 Riccardo Perra
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
      toUnist(node, children): Array<Code> {
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
          code.value ? [schema.text(code.value)] : [],
          { language: code.lang },
        )
      },
    }),
  )
}
