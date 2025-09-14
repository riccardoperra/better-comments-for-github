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

import {
  defineCommands,
  defineNodeSpec,
  insertNode,
  setBlockType,
  setNodeAttrs,
  toggleNode,
  union,
} from 'prosekit/core'
import { pmNode } from '@prosemirror-processor/unist'
import { defineCodeBlockCustomView } from './codemirror-editor'
import CmCodeBlockView from './cm-code-block-view'
import { codeMirrorLanguages } from './supported-languages'
import type { CodeBlockAttrs } from 'prosekit/extensions/code-block'
import type { Code, Text } from 'mdast'

export function defineCmCodeBlock() {
  return union(
    defineCodeBlockCommands(),
    defineNodeSpec({
      name: 'cmCodeBlock',
      content: 'text*',
      group: 'block',
      code: true,
      defining: true,
      isolating: true,
      marks: '',
      attrs: { language: { default: '', validate: 'string' } },
      parseDOM: [
        {
          tag: 'pre',
          preserveWhitespace: 'full',
          getAttrs: (node): CodeBlockAttrs | null => {
            const language =
              extractLanguageFromElement(node) ||
              extractLanguageFromElement(node.querySelector('code'))
            if (codeMirrorLanguages.includes(language)) {
              return { language }
            }
            return null
          },
        },
      ],
      toDOM(node) {
        const { language } = node.attrs as CodeBlockAttrs
        return [
          'pre',
          { 'data-language': language || undefined },
          // `class: language-${language}` is used by remark-rehype to highlight the code block
          ['code', { class: language ? `language-${language}` : undefined }, 0],
        ]
      },
      __toUnist: (node, parent, context) => {
        const children = context.handleAll(node)
        return {
          type: 'code',
          value: children
            .filter((child): child is Text => child.type === 'text')
            .map((child) => child.value)
            .join(''),
          lang: node.attrs.language,
        }
      },
      __fromUnist: (node, children, context) => {
        const code = node as Code,
          schema = context.schema
        return pmNode(
          context.schema.nodes.codeBlock,
          code.value ? [schema.text(code.value)] : [],
          { language: code.lang },
        )
      },
    }),
    defineCodeBlockCustomView({
      name: 'cmCodeBlock',
      contentAs: 'div',
      component: CmCodeBlockView,
    }),
  )
}

export function defineCodeBlockCommands() {
  return defineCommands({
    setCmCodeBlock: (attrs?: CodeBlockAttrs) => {
      return setBlockType({ type: 'cmCodeBlock', attrs })
    },
    insertCmCodeBlock: (attrs?: CodeBlockAttrs) => {
      return insertNode({ type: 'cmCodeBlock', attrs })
    },
    toggleCmCodeBlock: (attrs?: CodeBlockAttrs) => {
      return toggleNode({ type: 'cmCodeBlock', attrs })
    },
    setCodeBlockAttrs: (attrs: CodeBlockAttrs) => {
      return setNodeAttrs({ type: 'cmCodeBlock', attrs })
    },
  })
}

function extractLanguageFromElement(
  element: HTMLElement | null | undefined,
): string {
  if (!element) {
    return ''
  }
  const attr = element.getAttribute('data-language')
  if (attr) {
    return attr
  }
  const className = element.className
  const match = className.match(/language-(\w+)/)
  if (match) {
    return match[1]
  }
  return ''
}
