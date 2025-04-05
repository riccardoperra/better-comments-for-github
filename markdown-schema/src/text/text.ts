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

import { defineNodeSpec, defineText, union } from 'prosekit/core'
import type { Text } from 'mdast'

export function defineTextMarkdown() {
  return union(
    defineText(),
    defineNodeSpec({
      name: 'text',
      toUnist: (node, children): Array<Text> => [
        { type: 'text', value: node.text ?? '' },
      ],
      unistToNode(node, schema, children, context) {
        const text = node as Text
        if (!text.value) {
          return []
        }
        return [schema.text(text.value)]
      },
    }),
  )
}
