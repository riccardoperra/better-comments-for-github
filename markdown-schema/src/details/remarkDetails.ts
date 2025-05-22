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
import type { Processor } from 'unified'
import type { Root } from 'mdast'

const detailsEnter = '<details',
  detailsExit = '</details>',
  summaryEnter = '<summary',
  summaryExit = '</summary>'

export function remarkDetails(this: Processor) {
  return (root: Root) => {
    visit(root, 'html', (node, index, parent) => {
      if (
        !node.value.startsWith(detailsEnter) ||
        !node.value.endsWith(detailsExit)
      ) {
        return
      }

      const detailsMatch = node.value.match(
        /^<details\b[^>]*>([\s\S]*)<\/details>$/i,
      )
      if (!detailsMatch) return
      const insideDetails = detailsMatch[1].trim()

      const summaryMatch = insideDetails.match(
        /<summary\b[^>]*>([\s\S]*?)<\/summary>/i,
      )
      const summaryContent = summaryMatch ? summaryMatch[1].trim() : null

      const newChildren = []

      const restContent = summaryMatch
        ? insideDetails.replace(summaryMatch[0], '').trim()
        : insideDetails

      if (summaryContent !== null) {
        newChildren.push({
          type: 'detailsSummary',
          value: summaryContent,
        })
      } else {
        newChildren.push({
          type: 'detailsSummary',
          value: 'Details',
        })
      }

      if (restContent) {
        // you can choose to keep it as raw HTML, or parse further
        newChildren.push({
          type: 'detailsContent',
          value: restContent,
        })
      }

      // Wrap in a details node
      const detailsNode = {
        type: 'details',
        children: newChildren,
      }

      if (parent && index !== undefined) {
        parent.children.splice(index, 1, detailsNode)
      }
    })
  }
}
