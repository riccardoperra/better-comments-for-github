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
import { findAndReplace } from 'mdast-util-find-and-replace'
import { getLinkFromIssueReferenceAttrs } from './issue-reference-utils'
import type { ReplaceFunction } from 'mdast-util-find-and-replace'
import type { Node, Parent, Root, Text } from 'mdast'

export const githubIssueRegex =
  /(?:https?:\/\/)?github\.com\/([^/]+)\/([^/]+)\/(issues|pull)\/(\d+)/i

export const githubIssueReferenceType = 'githubIssueReference'

export interface GitHubIssueReference extends Node {
  /**
   * Node type of mdast list.
   */
  type: typeof githubIssueReferenceType
  /**
   * GitHub issue number
   */
  issue: number | string
  /**
   * GitHub repository owner
   */
  owner: string
  /**
   * GitHub repository name
   */
  repository: string
  /**
   * Whether the issue is a pull request
   */
  isPullRequest: boolean
  /**
   * Original href
   */
  href: string
}

declare module 'mdast' {
  interface RootContentMap {
    gitHubIssueReference: GitHubIssueReference
  }
}

declare module 'unist' {
  interface RootContentMap {
    gitHubIssueReference: typeof githubIssueReferenceType
  }
}

export function matchGitHubIssueLinkReference(text: string) {
  const match = text.match(githubIssueRegex)
  if (!match) {
    return null
  }
  const [, owner, repository, type, issue] = match
  return {
    owner,
    repository,
    type: type === 'pull' ? 'pull' : 'issue',
    issue,
    href: text,
  } as const
}

export function remarkParseLinkToGitHubIssueReference(options: {
  repository: string
  owner: string
}) {
  const { repository, owner } = options
  const replaceIssue: ReplaceFunction = (value, no, match) => {
    if (
      /\w/.test(match.input.charAt(match.index - 1)) ||
      /\w/.test(match.input.charAt(match.index + value.length))
    ) {
      return false
    }

    const url = ['https://github.com', owner, repository, 'issues', no].join(
      '/',
    )

    return url
      ? { type: 'link', title: null, url, children: [{ type: 'text', value }] }
      : false
  }

  return function transformer(tree: Root) {
    // First, we convert every # or GH- to a possible link
    findAndReplace(tree, [[/(?:#|\bgh-)([1-9]\d*)/gi, replaceIssue]])
    // TODO? Prefetch data?
    // Then we parse link into a reference node
    visit(tree, 'link', (link, index, parent) => {
      const href = link.url
      const match = matchGitHubIssueLinkReference(href)
      if (match) {
        const { owner, repository, issue } = match
        if (typeof index === 'number' && parent) {
          parent.children[index] = {
            type: githubIssueReferenceType,
            issue: Number(issue),
            owner,
            repository,
            isPullRequest: match.type === 'pull',
            href,
          } satisfies GitHubIssueReference
        }
      }
    })
  }
}

export function remarkGitHubIssueReferenceSupport() {
  return function transformer(tree: Root) {
    visit(tree, githubIssueReferenceType, (_issue, index, parent) => {
      const result: Text = {
        type: 'text',
        value: getLinkFromIssueReferenceAttrs({
          issue: _issue.issue,
          type: _issue.isPullRequest ? 'pull' : 'issue',
          owner: _issue.owner,
          repository: _issue.repository,
        }),
      }
      if (typeof index === 'number' && parent) {
        ;(parent as Parent).children[index] = result
        // If next to the link there is a text node, automatically add a space in order
        // to avoid the link to be concatenated with the text
        const nextEl = parent.children.at(index + 1)
        if (nextEl && nextEl.type === 'text' && nextEl.value[0] !== ' ') {
          nextEl.value = ' ' + nextEl.value
        }
      }
    })
  }
}
