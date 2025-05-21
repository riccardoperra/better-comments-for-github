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
import { pmNode } from '@prosemirror-processor/unist'
import type { CommentNode } from './remarkComment'
import type { Break, Html, Text } from 'mdast'

export function defineCommentMarkdown() {
  return union(
    defineNodeSpec({
      inline: true,
      content: '(text|hardBreak)+',
      group: 'inline',
      code: true,
      name: 'comment',
      unistName: 'comment',
      __toUnist: (pmNode, parent, context) => {
        const children = context.handleAll(pmNode) as Array<Text | Break>
        return {
          type: 'html',
          value:
            '<!--' +
            children
              .map((child) => (child.type === 'break' ? '\n' : child.value))
              .join('') +
            '-->',
        } as Html
      },
      __fromUnist: (_node, parent, context) => {
        const node = _node as unknown as CommentNode
        const rows = node.raw.split('\n')
        console.log(rows)
        const content = rows.flatMap((row, index, array) =>
          row === ''
            ? []
            : index === array.length - 1
              ? [context.schema.text(row)]
              : [
                  context.schema.text(row),
                  context.schema.nodes.hardBreak.create(),
                ],
        )
        return pmNode(context.schema.nodes.comment, content, {})
      },
    }),
  )
}
