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

import { definePlugin } from 'prosekit/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { codeMirrorLanguages } from './supported-languages'
import type { Transaction } from 'prosemirror-state'
import type { Node, NodeType } from 'prosemirror-model'

export function defineCmCodeBlockPlugin() {
  return definePlugin(
    new Plugin({
      key: new PluginKey('cmCodeBlockTransformer'),
      appendTransaction(transactions, oldState, newState) {
        let tr = newState.tr
        let modified = false

        try {
          for (const transaction of transactions) {
            if (!transaction.docChanged) {
              continue
            }
            for (const step of transaction.steps) {
              const map = step.getMap()
              map.forEach((oldStart, oldEnd, newStart, newEnd) => {
                newState.doc.nodesBetween(newStart, newEnd, (node, pos) => {
                  if (
                    node.type.name === 'codeBlock' &&
                    codeMirrorLanguages.includes(node.attrs.language)
                  ) {
                    modified = true
                    const cmCodeBlock = newState.schema.nodes.cmCodeBlock
                    tr = replaceWith(tr, pos, node, cmCodeBlock)
                  } else if (
                    node.type.name === 'cmCodeBlock' &&
                    !codeMirrorLanguages.includes(node.attrs.language)
                  ) {
                    modified = true
                    const codeBlock = newState.schema.nodes.codeBlock
                    tr = replaceWith(tr, pos, node, codeBlock)
                  }
                })
              })
            }
          }
        } catch (e) {
          return null
        }
        return modified ? tr : null
      },
    }),
  )
}

function replaceWith(tr: Transaction, pos: number, node: Node, type: NodeType) {
  return tr.replaceWith(
    pos,
    pos + node.nodeSize,
    type.create(node.attrs, node.content, node.marks),
  )
}
