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

import { defineMarkSpec, union } from 'prosekit/core'
import { defineCode } from 'prosekit/extensions/code'
import type { ToProseMirrorNodeHandler } from '@prosemirror-processor/unist/mdast'
import type { InlineCode } from 'mdast'
import type * as Mdast from 'mdast'

export function defineCodeMarkdown() {
  return union(
    defineCode(),
    defineMarkSpec({
      name: 'code',
      unistName: 'inlineCode',
      __toUnist: (node, _, children, context) => {
        const child = children.find((child) => child.type === 'text')
        return { type: 'inlineCode', value: child?.value ?? '' }
      },
      __fromUnist: ((node, _, context) => {
        const code = node as InlineCode
        if (!code.value) {
          return null
        }
        return context.schema
          .text(code.value)
          .mark([context.schema.marks.code.create()])
      }) satisfies ToProseMirrorNodeHandler<Mdast.Nodes>,
    }),
  )
}
