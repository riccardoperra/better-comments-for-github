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
import { githubAlertTypeMap } from './config'
import type { Root } from 'mdast'

const matches = Object.entries(githubAlertTypeMap).map(([type, { match }]) => ({
  match,
  type,
}))

export function remarkGitHubAlert() {
  return function transformer(tree: Root) {
    visit(tree, 'blockquote', (blockquote) => {
      const firstChildNode = blockquote.children.find(
        (child) => child.type === 'paragraph',
      )
      if (!firstChildNode) {
        return
      }
      let found = false
      for (const child of firstChildNode.children) {
        if (child.type === 'text') {
          // Support GitHub syntax
          const foundMatch = matches.find(({ match }) =>
            child.value.includes(match),
          )

          if (foundMatch) {
            Object.assign(blockquote, {
              variant: foundMatch.type,
              type: 'githubAlert',
            })
            child.value = child.value
              .replaceAll(foundMatch.match, '')
              .replace('\n', '')
            found = true
            break
          }
        }
      }
      if (found) {
        // Removing first entry in order to remove the first blank paragraph, which was the alert type
        const firstChildren = blockquote.children.at(0)
        if (
          firstChildren &&
          'children' in firstChildren &&
          // If an empty paragraph is inserted, we have a text node with an empty string
          (firstChildren.children.length === 0 ||
            (firstChildren.children.length === 1 &&
              firstChildren.children[0].type === 'text' &&
              firstChildren.children[0].value === ''))
        ) {
          blockquote.children = blockquote.children.slice(
            1,
            blockquote.children.length,
          )
        }
      }
    })
  }
}
