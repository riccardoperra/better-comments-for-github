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
import { defineList } from 'prosekit/extensions/list'
import { toProseMirrorNode } from '@prosemirror-processor/unist/mdast'
import type { List } from 'mdast'
import type { FlatList } from './remarkFlatList'

// TODO: check prosemirror-flatlist impl
export function defineListMarkdown() {
  return union(
    defineList(),
    defineNodeSpec({
      name: 'list',
      unistName: 'flatList',

      __fromUnist: toProseMirrorNode('list', (_node) => {
        const node = _node as FlatList
        return {
          kind: node.kind,
          checked: node.kind === 'task' ? node.checked : undefined,
        }
      }),

      __toUnist: (node, parent, context) => {
        const children = context.handleAll(node)
        const checked = node.attrs.kind !== 'task' ? null : node.attrs.checked
        return {
          type: 'list',
          spread: false,
          start: null,
          ordered: node.attrs.kind === 'ordered',
          children: [
            {
              type: 'listItem',
              checked,
              // TODO: Fix types
              children: children,
            },
          ],
        } as List
      },
    }),
  )
}

export * from './mergeAdjacentList'
export * from './remarkFlatList'
