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
import { getLinkFromIssueReferenceAttrs } from './issue-reference-utils'
import type { Node, Parent, Root, Text } from 'mdast'

export const githubIssueRegex =
  /(?:https?:\/\/)?github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/i

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
  const [, owner, repository, issue] = match
  return { owner, repository, issue } as const
}

export function remarkParseLinkToGitHubIssueReference() {
  return function transformer(tree: Root) {
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
        value: getLinkFromIssueReferenceAttrs(_issue),
      }
      if (typeof index === 'number' && parent) {
        ;(parent as Parent).children[index] = result
      }
    })
  }
}
