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

import _remarkComment from 'remark-comment-config'
import { visit } from 'unist-util-visit'
import type { Processor } from 'unified'
import type { BlockContent, Html, Node, Root, Text } from 'mdast'
import type { TransformerRemarkHandler } from '@prosemirror-processor/markdown'

export const commentNodeType = 'comment'

export interface CommentNode extends Omit<Html, 'type'> {
  /**
   * Node type of mdast comment.
   */
  type: typeof commentNodeType
  /**
   * Raw comment content
   */
  raw: string
  /**
   * Parsed comment nodes
   */
  children: Array<BlockContent>
}

declare module 'mdast' {
  interface PhrasingContentMap {
    comment: CommentNode
  }
}

declare module 'unist' {
  interface PhrasingContentMap {
    comment: typeof commentNodeType
  }
}

// TODO: Experimental. Check implementation later
function parseInnerComment(self: Processor, raw: string) {
  const content = self.runSync(self.parse(raw)) as Root
  const sanitizedNode: Array<Node> = []

  for (const child of content.children) {
    if (child.type === 'html') {
      sanitizedNode.push({ type: 'text', value: child.value } as Text)
    } else {
      sanitizedNode.push(child)
    }
  }

  return sanitizedNode
}

export function remarkComment(this: Processor) {
  const self = this
  _remarkComment.call(self)
  return ((tree) => {
    visit(tree, 'html', (node, index, parent) => {
      if (
        parent &&
        index !== undefined &&
        node.value.startsWith('<!--') &&
        node.value.endsWith('-->')
      ) {
        const isRoot = parent.type === 'root' && parent

        const raw = node.value.slice(
          '<!--'.length,
          node.value.length - '-->'.length,
        )

        const content = parseInnerComment(self, raw)

        const commentNode = {
          ...node,
          type: commentNodeType,
          children: content,
          raw,
        } as CommentNode

        if (isRoot) {
          // Currently, comments are always inline,
          // so we should wrap them into a paragraph node
          parent.children[index] = {
            type: 'paragraph',
            children: [commentNode],
          }
        } else {
          parent.children[index] = commentNode
        }
      }
    })
  }) satisfies ReturnType<TransformerRemarkHandler>
}
