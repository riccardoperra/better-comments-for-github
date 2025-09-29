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
import {
  getIssueReferenceTypeAttrFromLink,
  getLinkFromIssueReferenceAttrs,
} from './issue-reference-utils'
import type { ReplaceFunction } from 'mdast-util-find-and-replace'
import type { Node, Parent, Root, Text } from 'mdast'
import type { ReferenceSuggestion } from '../../../editor/utils/loadSuggestionData'

export const githubIssueRegex =
  /(?:https?:\/\/)?github\.com\/(?<owner>[^/]+)\/(?<repo>[^/]+)\/(?<type>issues|pull|discussions)\/(?<number>\d+)(?:#(?:issuecomment|discussioncomment)-(?<commentId>\d+))?/i

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
   * The reference type.
   */
  referenceType: 'issue' | 'pull' | 'discussion'
  /**
   * Original href
   */
  href: string
  /**
   * Link to the comment reply if present.
   */
  commentId?: string
  /**
   * Phrasing content for unmatched issue reference.
   */
  fallbackText?: string
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
    type: getIssueReferenceTypeAttrFromLink(type),
    issue,
    href: text,
    commentId: match.groups?.commentId || null,
  } as const
}

export function remarkParseLinkToGitHubIssueReference(options: {
  repository: string
  owner: string
  references: () => Array<ReferenceSuggestion>
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

  const referenceLinkRegExp = /(?:#|\bgh-)([1-9]\d*)/gi

  return function transformer(tree: Root) {
    // First, we convert every # or GH- to a possible link
    findAndReplace(tree, [[referenceLinkRegExp, replaceIssue]])
    // TODO? Prefetch data?
    // Then we parse link into a reference node
    visit(tree, 'link', (link, index, parent) => {
      const href = link.url
      const match = matchGitHubIssueLinkReference(href)

      if (match) {
        const reference = options
          .references()
          .find((reference) => reference.id === String(match.issue))

        const phrasingContent = link.children.at(0)
        let phrasingContentText: string | null = null
        if (phrasingContent && phrasingContent.type === 'text') {
          phrasingContentText = phrasingContent.value
          if (
            phrasingContent.value !== link.url &&
            !referenceLinkRegExp.test(phrasingContent.value) &&
            !reference
          ) {
            return
          }
        }
        const { owner, repository, issue, commentId, type } = match

        const issueType = reference ? reference.candidateType || type : type

        if (typeof index === 'number' && parent) {
          parent.children[index] = {
            type: githubIssueReferenceType,
            issue: Number(issue),
            owner,
            repository,
            referenceType: issueType,
            href,
            commentId: commentId || undefined,
            fallbackText: phrasingContentText || undefined,
          } satisfies GitHubIssueReference
        }
      }
    })
  }
}

export function remarkGitHubIssueReferenceSupport(
  references: () => Array<ReferenceSuggestion>,
) {
  return function transformer(tree: Root) {
    visit(tree, githubIssueReferenceType, (_issue, index, parent) => {
      const isReferenced = references().find(
        (reference) => reference.id === String(_issue.issue),
      )

      const result: Text = {
        type: 'text',
        value: isReferenced
          ? `#${_issue.issue}`
          : getLinkFromIssueReferenceAttrs({
              issue: _issue.issue,
              type: _issue.referenceType,
              owner: _issue.owner,
              repository: _issue.repository,
              commentId: _issue.commentId,
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
