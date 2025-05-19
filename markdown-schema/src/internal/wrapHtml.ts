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

import type { Html, Node, PhrasingContent } from 'mdast'

export function wrapMixedHtmlContent(
  htmlNode: Html,
  index: number,
  parent: { children: Array<Node> },
  options: { enterTag: string; exitTag: string; type: string },
) {
  if (htmlNode.value !== options.enterTag) return

  let endNode: Html | undefined = undefined,
    nodeIndex: number | undefined = undefined
  const size = parent.children.length,
    nodeChildren = [] as Array<PhrasingContent>

  let i = index + 1
  while (i < size) {
    const el = parent.children.at(i)
    if (el && el.type === 'html' && (el as Html).value === options.exitTag) {
      nodeIndex = i
      endNode = parent.children[i] as Html
      break
    }
    nodeChildren.push(el as PhrasingContent)
    i++
  }

  if (endNode && nodeIndex !== undefined) {
    parent.children.splice(index, nodeIndex + 1, {
      type: options.type,
      children: nodeChildren,
    } as any)
    console.dir(parent, { depth: null })
    return
  }

  return
}
