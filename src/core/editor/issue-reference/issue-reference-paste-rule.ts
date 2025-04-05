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

import { definePlugin, insertNode } from 'prosekit/core'
import { Plugin, PluginKey } from 'prosekit/pm/state'
import { matchGitHubIssueLinkReference } from './remarkGitHubIssueReference'
import { getLinkFromIssueReferenceAttrs } from './issue-reference-utils'

export function defineIssueReferencePasteRule() {
  return definePlugin(
    new Plugin({
      key: new PluginKey('handlePasteIssueReference'),
      props: {
        handlePaste: (view, event, slice) => {
          let textContent = ''

          slice.content.forEach((node) => {
            textContent += node.textContent
          })
          if (!textContent) {
            return false
          }
          const match = matchGitHubIssueLinkReference(textContent)

          if (!match) {
            return false
          }
          const url = getLinkFromIssueReferenceAttrs(match)
          if (url !== textContent) {
            return false
          }

          const command = insertNode({
            type: 'gh-issue-reference',
            attrs: match,
          })

          return command(view.state, view.dispatch)
        },
      },
    }),
  )
}
