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
  Priority,
  defineNodeSpec,
  defineParagraph,
  union,
  withPriority,
} from 'prosekit/core'
import {
  fromProseMirrorNode,
  toProseMirrorNode,
} from '@prosemirror-processor/unist/mdast'

export function defineParagraphMarkdown() {
  return withPriority(
    union(
      defineParagraph(),
      defineNodeSpec({
        name: 'paragraph',
        unistName: 'paragraph',
        // @ts-expect-error TODO: fix types
        __toUnist: fromProseMirrorNode('paragraph'),
        __fromUnist: toProseMirrorNode('paragraph'),
      }),
    ),
    Priority.highest,
  )
}
