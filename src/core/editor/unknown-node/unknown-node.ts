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

import { defineNodeSpec } from 'prosekit/core'
import type { Text } from 'mdast'

export function defineUnknownNodeSpec() {
  return defineNodeSpec({
    name: 'unknownBlock',
    group: 'inline',
    inline: true,
    content: '(text|hardBreak)+',
    __toUnist: (node, parent, context) => {
      return {
        type: 'text',
        value: node.textContent,
      } as Text
    },
    toDOM() {
      return ['span', { style: 'display: contents', class: 'unknown-block' }, 0]
    },
  })
}
