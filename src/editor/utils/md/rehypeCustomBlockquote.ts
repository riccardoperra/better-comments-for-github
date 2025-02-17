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

import { visit } from 'unist-util-visit'

export function rehypeBlockquote() {
  return function transformer(tree: any) {
    visit(tree, 'blockquote', (blockquote) => {
      const firstChildNode = blockquote.children.find(
        (child: any) => child.type === 'paragraph',
      )
      if (!firstChildNode) {
        return
      }
      for (const child of firstChildNode.children) {
        // Support custom props: `prop1=value`
        if (child.type === 'text') {
          // Support GitHub syntax
          const match = [
            { match: '[!WARNING]', type: 'warning' },
            { match: '[!NOTE]', type: 'info' },
          ].find(({ match }) => child.value.includes(match))

          if (match) {
            blockquote.type = 'blockquoteCallout'
            // blockquote.properties.type = match.type
            child.value = child.value.replaceAll(match, '')
            break
          }
        }
      }
    })
  }
}
