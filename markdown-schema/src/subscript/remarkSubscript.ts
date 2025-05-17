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
import { wrapMixedHtmlContent } from '../internal/wrapHtml'
import type { PhrasingContent, Root } from 'mdast'

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
      wrapMixedHtmlContent(node, index, parent, {
        type: subscriptType,
        enterTag: '<sub>',
        exitTag: '</sub>',
      })
    })
  }
}
