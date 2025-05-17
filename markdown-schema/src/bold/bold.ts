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
import { defineBold } from 'prosekit/extensions/bold'
import {
  fromProseMirrorMark,
  toProseMirrorMark,
} from '@prosemirror-processor/unist/mdast'
import type { PhrasingContent, Strong } from 'mdast'

export function defineBoldMarkdown() {
  return union(
    defineBold(),
    defineMarkSpec({
      name: 'bold',
      unistName: 'strong',
      __toUnist: (mark, node, children, context) => {
        return fromProseMirrorMark('strong')(
          mark,
          node,
          children,
          // @ts-expect-error TDOO: Fix types
          context,
        )
      },
      __fromUnist: toProseMirrorMark('bold'),
      toUnist(node): Strong {
        return { type: 'strong', children: [node] as Array<PhrasingContent> }
      },
      unistToNode(node, schema, children, context) {
        return children.map((child) =>
          child.mark(child.marks.concat(schema.marks.bold.create())),
        )
      },
    }),
  )
}
