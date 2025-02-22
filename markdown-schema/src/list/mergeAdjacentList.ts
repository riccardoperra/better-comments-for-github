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
import type { List, ListItem, Root } from 'mdast'

export function unistMergeAdjacentList(tree: Root) {
  function mergeLists(node: List, parent: ListItem | Root) {
    for (let i = 0; i < parent.children.length - 1; i++) {
      const currentList = parent.children[i] as List
      const nextNode = parent.children[i + 1] as List | undefined

      if (
        nextNode &&
        nextNode.type === 'list' &&
        nextNode.ordered === currentList.ordered
      ) {
        // Merge the children of the next list into the current list
        currentList.children.push(...nextNode.children)
        // Remove the next list from the parent's children
        parent.children.splice(i + 1, 1)
        // Decrement the index to recheck the current position
        i--
      }
    }

    // Recursively merge nested lists and keep list items
    node.children.forEach((child) => {
      if (child.type === 'listItem') {
        const listItem = child
        listItem.spread = false
        listItem.children.forEach((nestedChild) => {
          if (nestedChild.type === 'list') {
            // Keep the list item and directly append the nested list to the parent
            mergeLists(nestedChild, listItem)
          }
        })
      }
    })
  }

  visit(tree, 'list', (node, index, parent) => {
    if (!parent || !Array.isArray(parent.children)) return
    mergeLists(node, parent as ListItem | Root)
  })
}
