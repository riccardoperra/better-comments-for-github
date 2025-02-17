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
import { defineMention } from 'prosekit/extensions/mention'
import type { Text } from 'mdast'

export function defineMentionMarkdown() {
  return union(
    defineMention(),
    defineNodeSpec({
      name: 'mention',
      toUnist: (node, children): Array<Text> => {
        return [{ type: 'text', value: node.attrs.value ?? '' }]
      },
      unistToNode(node, schema, children, context) {
        const text = node as Text
        return [schema.text(text.value)]
      },
    }),
  )
}
