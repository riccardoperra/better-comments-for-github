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
import { defineCodeBlockMarkdown as coreDefineCodeBlockMarkdown } from '@prosedoc/markdown-schema'
import { pmNode } from '@prosemirror-processor/unist'
import type { Code, Nodes as MdastNodes, Text } from 'mdast'
import type {
  ProseMirrorNodeToMdastHandler,
  ToProseMirrorNodeHandler,
} from '@prosemirror-processor/unist/mdast'

export function defineCodeBlockMarkdown() {
  return union(
    coreDefineCodeBlockMarkdown(),
    defineNodeSpec({
      name: 'codeBlock',
      attrs: {
        isSuggestion: {
          default: false,
        },
        suggestionConfig: {
          default: null,
        },
      },
      __toUnist: ((node, parent, context) => {
        const children = context.handleAll(node)

        const lang = node.attrs.isSuggestion
          ? 'suggestion'
          : node.attrs.language

        return {
          type: 'code',
          value: children
            .filter((child): child is Text => child.type === 'text')
            .map((child) => child.value)
            .join(''),
          lang,
        }
      }) satisfies ProseMirrorNodeToMdastHandler<MdastNodes, MdastNodes>,
      __fromUnist: ((node, children, context) => {
        const code = node as Code,
          schema = context.schema
        return pmNode(
          context.schema.nodes.codeBlock,
          code.value ? [schema.text(code.value)] : [],
          {
            language: code.lang,
            isSuggestion: code.isSuggestion || false,
            suggestChangeConfig: code.suggestChangeConfig,
          },
        )
      }) satisfies ToProseMirrorNodeHandler<MdastNodes>,
    }),
  )
}
