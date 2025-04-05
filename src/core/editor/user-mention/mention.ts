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

import { defineNodeSpec, union } from 'prosekit/core'
import { defineMention } from 'prosekit/extensions/mention'
import { defineSolidNodeView } from 'prosekit/solid'
import { toProseMirrorNode } from '@prosemirror-processor/unist/mdast'
import { UserMentionView } from './UserMentionView/UserMentionView'
import type { MentionAttrs } from 'prosekit/extensions/mention'
import type { GitHubMention } from '../../../editor/utils/remarkGitHubUserReferences'

export function defineMentionMarkdown() {
  return union(
    defineMention(),
    defineNodeSpec({
      name: 'mention',
      parseDOM: [
        {
          tag: 'a.user-mention',
          priority: 1_000,
          getAttrs: (node) => {
            console.log(node)
            const href = (node as HTMLLinkElement).href
            const parts = href.split('https://github.com/')
            const id = parts.at(-1)
            if (!id) return false
            return {
              kind: 'user',
              id,
              value: `@${id}`,
            } satisfies MentionAttrs
          },
        },
      ],
      __toUnist: (node) => {
        return { type: 'text', value: node.attrs.value ?? '' }
      },
      // @ts-expect-error TODO: fix types
      __fromUnist: toProseMirrorNode<GitHubMention>('mention', (mention) => {
        return {
          kind: 'user',
          id: mention.id,
          value: `@${mention.id}`,
        } satisfies MentionAttrs
      }),
    }),
    defineSolidNodeView({
      name: 'mention',
      as: 'span',
      contentAs: 'span',
      component: UserMentionView,
    }),
  )
}
