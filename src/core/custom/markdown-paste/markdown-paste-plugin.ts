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

import { Plugin } from 'prosemirror-state'
import { convertUnistToProsemirror } from 'prosemirror-transformer-markdown/prosemirror'
import { definePlugin } from 'prosekit/core'
import { unistMergeAdjacentList } from '@prosedoc/markdown-schema'
import { unistNodeFromMarkdown } from '../../../editor/utils/unistNodeFromMarkdown'
import { unknownNodeHandler } from '../unknown-node/unknown-node-handler'
import { remarkGitHubIssueReferenceSupport } from '../issue-reference/remarkGitHubIssueReference'
import { fixRawContent } from '../../../editor/utils/setContent'

// TODO: use paste rules!
function isMarkdown(text: string): boolean {
  const mdPatterns = [
    /^#{1,6}\s.+/m, // headings
    /^\s*[-*+]\s.+/m, // bullet list
    /^\d+\.\s.+/m, // ordered list
    /\[.+]\(.+\)/, // link
    /`{1,3}[^`]+`{1,3}/, // code
    /^>\s.+/m, // blockquote
  ]
  return mdPatterns.some((re) => re.test(text))
}

const markdownPastePlugin = new Plugin({
  props: {
    handlePaste(view, event, slice) {
      const text = event.clipboardData?.getData('text/plain') ?? ''

      if (isMarkdown(text)) {
        // todo: should be more generic in order to be used everywhere
        const unistNode = [
          (node: any) => unistMergeAdjacentList(node),
          (node: any) => remarkGitHubIssueReferenceSupport()(node),
        ].reduce(
          (node, fn) => {
            fn(node)
            return node
          },
          unistNodeFromMarkdown(fixRawContent(text), {
            repository: '',
            owner: '',
          }),
        )

        const result = convertUnistToProsemirror(
          unistNode,
          view.state.schema,
          unknownNodeHandler(text),
        )
        const tr = view.state.tr.replaceSelectionWith(result)
        view.dispatch(tr)

        // Handle differently: parse as markdown → ProseMirror doc
        return true // prevent default handling
      }

      return false // fallback to normal paste
    },
  },
})

export function defineMarkdownPastePlugin() {
  return definePlugin(markdownPastePlugin)
}
