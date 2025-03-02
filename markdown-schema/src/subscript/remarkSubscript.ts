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
import type { Html, Paragraph, PhrasingContent, Root } from 'mdast'

export const subscriptType = 'subscript'

export interface Subscript extends Node {
  /**
   * Node type of mdast list.
   */
  type: typeof subscriptType

  children: Array<PhrasingContent>
}

declare module 'mdast' {
  interface PhrasingContentMap {
    subscript: Subscript
  }
}

export function remarkSubscript() {
  return (root: Root) => {
    visit(root, 'html', (node, index, parent) => {
      if (!parent || index === undefined) return
      if (node.value === '<sub>') {
        let endNode: Html | null = null
        const current = index,
          size = parent.children.length

        let i = current + 1
        let nodeIndex: number | null = null
        const nodeChildren = [] as Array<any>
        while (i < size) {
          const el = parent.children.at(i)
          if (el && el.type === 'html' && el.value === '</sub>') {
            nodeIndex = i
            endNode = parent.children[i] as Html
            break
          }
          nodeChildren.push(el)
          i++
        }

        if (endNode && nodeIndex !== null) {
          ;(parent as Paragraph).children.splice(current, nodeIndex, {
            type: 'subscript',
            children: nodeChildren,
          } as any)
        }
      }
    })
  }
}
