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

import {
  defineCommands,
  defineNodeSpec,
  insertNode,
  union,
} from 'prosekit/core'
import { defineSolidNodeView } from 'prosekit/solid'
import { toProseMirrorNode } from '@prosemirror-processor/unist/mdast'
import {
  githubIssueReferenceType,
  matchGitHubIssueLinkReference,
} from './remarkGitHubIssueReference'
import { IssueReferenceView } from './IssueReferenceView/IssueReferenceView'
import { defineIssueReferencePasteRule } from './issue-reference-paste-rule'
import {
  getIssueReferenceTypeAttrFromLink,
  getLinkFromIssueReferenceAttrs,
} from './issue-reference-utils'
import type { GitHubIssueReference } from './remarkGitHubIssueReference'

export interface GitHubIssueReferenceAttrs {
  issue: number | string
  repository: string
  owner: string
  type: 'pull' | 'issue' | 'discussion'
  href: string
  commentId?: string
}

/**
 * @public
 */
export function defineIssueReferenceSpec() {
  return defineNodeSpec<'gh-issue-reference', GitHubIssueReferenceAttrs>({
    name: 'gh-issue-reference',
    unistName: githubIssueReferenceType,
    atom: true,
    group: 'inline',
    attrs: {
      issue: {},
      repository: {},
      owner: {},
      type: {},
      href: {},
      commentId: {
        default: undefined,
      },
    },
    inline: true,
    leafText: (node) => {
      return getLinkFromIssueReferenceAttrs(
        node.attrs as GitHubIssueReferenceAttrs,
      )
    },
    __toUnist: (node) => {
      const attrs = node.attrs as GitHubIssueReferenceAttrs
      return {
        type: githubIssueReferenceType,
        issue: attrs.issue,
        owner: attrs.owner,
        repository: attrs.repository,
        href: attrs.href,
        referenceType: attrs.type,
        commentId: attrs.commentId,
      } satisfies GitHubIssueReference
    },
    __fromUnist: toProseMirrorNode<GitHubIssueReference>(
      'gh-issue-reference',
      (node) => {
        return {
          issue: node.issue,
          owner: node.owner,
          repository: node.repository,
          type: node.referenceType,
          href: node.href,
          commentId: node.commentId,
        } satisfies GitHubIssueReferenceAttrs
      },
    ) as any,
    parseDOM: [
      {
        tag: `a[href]`,
        priority: 1000,
        getAttrs: (dom: HTMLElement): GitHubIssueReferenceAttrs | false => {
          const href = (dom as HTMLAnchorElement).href
          const match = matchGitHubIssueLinkReference(href)
          if (!match) {
            return false
          }
          const { issue, repository, owner } = match
          return {
            owner,
            repository,
            issue: Number(issue),
            href,
            type: getIssueReferenceTypeAttrFromLink(match.type),
          }
        },
      },
    ],
    toDOM(node) {
      const { issue, owner, repository, type } =
        node.attrs as GitHubIssueReferenceAttrs
      return [
        'a',
        {
          href: getLinkFromIssueReferenceAttrs(
            node.attrs as GitHubIssueReferenceAttrs,
          ),
          'data-issue': issue,
          'data-owner': owner,
          'data-repository': repository,
          'data-type': type,
        },
        `#${issue}`,
      ]
    },
  })
}

export function defineIssueReferenceCommands() {
  return defineCommands({
    insertGitHubIssueReference: (
      attrs: Omit<GitHubIssueReferenceAttrs, 'href'>,
    ) => {
      return insertNode({
        type: 'gh-issue-reference',
        attrs: {
          ...attrs,
          href: getLinkFromIssueReferenceAttrs(attrs),
        },
      })
    },
  })
}

/**
 * @public
 */
export function defineGitHubIssueReference() {
  return union(
    defineIssueReferenceSpec(),
    defineIssueReferencePasteRule(),
    defineIssueReferenceCommands(),
    defineSolidNodeView({
      name: 'gh-issue-reference',
      as: 'span',
      contentAs: 'span',
      component: IssueReferenceView,
    }),
  )
}
