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

import { defineDoc, defineNodeSpec, union } from 'prosekit/core'
import { createProseMirrorNode } from 'prosemirror-transformer-markdown/prosemirror'

export function defineDocMarkdown() {
  return union(
    defineDoc(),
    defineNodeSpec({
      name: 'doc',
      topNode: true,
      content: 'block+',
      unistName: 'root',
      toUnist: (node, children) => [{ children, type: 'root' }],
      unistToNode(node, schema, children, context) {
        return createProseMirrorNode('doc', schema, children)
      },
    }),
  )
}
