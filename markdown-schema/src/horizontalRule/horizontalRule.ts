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
import { defineHorizontalRule } from 'prosekit/extensions/horizontal-rule'
import { createProseMirrorNode } from 'prosemirror-transformer-markdown/prosemirror'
import type { ThematicBreak } from 'mdast'

export function defineHorizontalRuleMarkdown() {
  return union(
    defineHorizontalRule(),
    defineNodeSpec({
      name: 'horizontalRule',
      unistName: 'thematicBreak',
      toUnist(node, children): Array<ThematicBreak> {
        return [
          {
            type: 'thematicBreak',
          },
        ]
      },
      unistToNode(node, schema, children, context) {
        return createProseMirrorNode('horizontalRule', schema, children)
      },
    }),
  )
}
