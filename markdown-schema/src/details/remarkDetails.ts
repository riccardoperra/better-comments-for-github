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
import type { Parent, Root } from 'mdast'

const detailsEnter = '<details',
  detailsExit = '</details>',
  summaryEnter = '<summary',
  summaryExit = '</summary>'

export const detailsNodeType = 'details'
export const detailsSummary = 'detailsSummary'
export const detailsContent = 'detailsContent'

export interface DetailsNode extends Parent {
  /**
   * Node type of mdast details.
   */
  type: typeof detailsNodeType

  children: [DetailsSummary, ...Array<DetailsContent>]
}

export interface DetailsSummary {
  /**
   * Node type of mdast details.
   */
  type: typeof detailsSummary

  value: string
}

export interface DetailsContent {
  /**
   * Node type of mdast details.
   */
  type: typeof detailsContent

  value: string
}

declare module 'mdast' {
  interface RootContentMap {
    details: DetailsNode
    detailsSummary: DetailsSummary
    detailsContent: DetailsContent
  }
}

declare module 'unist' {
  interface RootContentMap {
    details: typeof detailsNodeType
    detailsSummary: typeof detailsSummary
    detailsContent: typeof detailsContent
  }
}

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

      const newChildren = [] as unknown as DetailsNode['children']

      const restContent = summaryMatch
        ? insideDetails.replace(summaryMatch[0], '').trim()
        : insideDetails

      if (summaryContent !== null) {
        newChildren.push({
          type: 'detailsSummary',
          value: summaryContent,
        } as DetailsSummary)
      } else {
        newChildren.push({
          type: 'detailsSummary',
          value: 'Details',
        } as DetailsSummary)
      }

      if (restContent) {
        // you can choose to keep it as raw HTML, or parse further
        newChildren.push({
          type: 'detailsContent',
          value: restContent,
        } as DetailsContent)
      }

      // Wrap in a details node
      const detailsNode: DetailsNode = {
        type: 'details',
        children: newChildren,
      }

      if (parent && index !== undefined) {
        parent.children.splice(index, 1, detailsNode)
      }
    })
  }
}
