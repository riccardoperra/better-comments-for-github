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

import { union, defineNodeSpec } from 'prosekit/core'
import { mathBlockSpec, mathInlineSpec } from 'prosemirror-math'
import { pmNode } from '@prosemirror-processor/unist'
import type {
  ProseMirrorNodeToMdastHandler,
  ToProseMirrorNodeHandler,
} from '@prosemirror-processor/unist/mdast'
import type { Nodes as MdastNodes } from 'mdast'
import type { InlineMath, Math } from 'mdast-util-math'

export function defineMathMarkdown() {
  return union(
    defineNodeSpec({
      name: 'mathInline',
      unistName: 'inlineMath',
      ...mathInlineSpec,
      __toUnist: ((node) => {
        return {
          type: 'inlineMath',
          value: node.textContent,
        }
      }) satisfies ProseMirrorNodeToMdastHandler<MdastNodes, MdastNodes>,
      __fromUnist: ((node, children, context) => {
        const value = (node as InlineMath).value ?? ''
        const schema = context.schema
        return pmNode(
          schema.nodes.mathInline,
          value ? [schema.text(value)] : [],
        )
      }) satisfies ToProseMirrorNodeHandler<MdastNodes>,
    }),
    defineNodeSpec({
      name: 'mathBlock',
      unistName: 'math',
      ...mathBlockSpec,
      __toUnist: ((node) => {
        return {
          type: 'math',
          value: node.textContent,
        }
      }) satisfies ProseMirrorNodeToMdastHandler<MdastNodes, MdastNodes>,
      __fromUnist: ((node, children, context) => {
        const value = (node as Math).value ?? ''
        const schema = context.schema
        return pmNode(
          schema.nodes.mathBlock,
          value ? [schema.text(value)] : [],
        )
      }) satisfies ToProseMirrorNodeHandler<MdastNodes>,
    }),
  )
}

export { default as remarkMath } from 'remark-math'
