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

import { EXIT, visit } from 'unist-util-visit'
import { toHast } from 'mdast-util-to-hast'
import { toHtml } from 'hast-util-to-html'
import type { PhrasingContent, Root } from 'mdast'

const nodeTypes: Array<string> = [
  'text',
  'break',
  'link',
  'inlineCode',
  'strong',
] satisfies Array<PhrasingContent['type']>

export function remarkTableToHtmlOnComplexContent() {
  return (tree: Root) => {
    visit(tree, 'table', (node, index, parent) => {
      let complex = false

      visit(node, 'tableCell', (cell) => {
        visit(cell, function (node) {
          if (node.type !== 'tableCell' && !nodeTypes.includes(node.type)) {
            complex = true
            return EXIT
          }
          if (complex) {
            return EXIT
          }
        })
      })

      if (complex && parent && typeof index === 'number') {
        const hast = toHast(node)
        const html = toHtml(hast)
        parent.children[index] = { type: 'html', value: html }
      }
    })
  }
}
