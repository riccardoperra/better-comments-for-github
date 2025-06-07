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

import { findAndReplace } from 'mdast-util-find-and-replace'
import type { githubIssueReferenceType } from '../issue-reference/remarkGitHubIssueReference'
import type { ReplaceFunction } from 'mdast-util-find-and-replace'
import type { Node, Root } from 'mdast'

export const gitHubMentionType = 'mention'

export interface GitHubMention extends Node {
  /**
   * Node type of mdast list.
   */
  type: typeof gitHubMentionType
  /**
   * Mention identifier
   */
  id: string
  /**
   * Mention href
   */
  href: string
}

declare module 'mdast' {
  interface PhrasingContentMap {
    githubMention: GitHubMention
  }
}

declare module 'unist' {
  interface PhrasingContentMap {
    githubMention: typeof githubIssueReferenceType
  }
}

export function remarkGitHubUserReferences() {
  const userGroup = '[\\da-z][-\\da-z]{0,38}'
  const mentionRegex = new RegExp(
    '@(' + userGroup + '(?:\\/' + userGroup + ')?)',
    'gi',
  )

  return (root: Root) => {
    findAndReplace(root, [[mentionRegex, replaceMention]], {
      ignore: ['link', 'linkReference'],
    })
  }
}

// Previously, GitHub linked `@mention` and `@mentions` to their blog post about
// mentions (<https://github.com/blog/821>).
// Since June 2019, and possibly earlier, they stopped linking those references.
const denyMention = new Set(['mention', 'mentions'])

const replaceMention: ReplaceFunction = (
  value: string,
  username: string,
  match: any,
) => {
  if (
    /[\w`]/.test(match.input.charAt(match.index - 1)) ||
    /[/\w`]/.test(match.input.charAt(match.index + value.length)) ||
    denyMention.has(username)
  ) {
    return false
  }
  const url = `https://github.com/${username}`

  return {
    type: 'mention',
    id: username,
    href: url,
  } satisfies GitHubMention
}
