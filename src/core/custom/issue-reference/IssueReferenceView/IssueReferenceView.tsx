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

import { useNodeViewContext } from '@prosemirror-adapter/solid'
import {
  Match,
  Show,
  Switch,
  createMemo,
  createResource,
  useContext,
} from 'solid-js'

import LucideLoaderCircle from 'lucide-solid/icons/loader-circle'
import { clsx } from 'clsx'
import { CacheStore } from '../../../../cache.store'
import {
  HoverCard,
  HoverCardArrow,
  HoverCardContent,
  HoverCardTrigger,
} from '../../../ui/hover-card/HoverCard'
import { getLinkFromIssueReferenceAttrs } from '../issue-reference-utils'
import {
  getDiscussionHoverCardContent,
  getIssueHoverCardContent,
  getPullRequestHoverCardContent,
} from '../../../../github/data'
import { EditorRootContext } from '../../../../editor/editor'
import styles from './IssueReferenceView.module.css'
import type { GitHubIssueReferenceAttrs } from '../issue'
import type { NodeViewContextProps } from '@prosemirror-adapter/solid'

const NOT_FOUND = Symbol()

export function IssueReferenceView(props: NodeViewContextProps) {
  const cacheStorage = CacheStore.provide()
  const editorContext = useContext(EditorRootContext)!
  const context = useNodeViewContext()
  const suggestionData = editorContext.suggestionData

  const isReferenced = createMemo(() => {
    const issue = context().node.attrs.issue
    return suggestionData().references.find(
      (reference) => reference.id === String(issue),
    )
  })

  const attrs = (): GitHubIssueReferenceAttrs => {
    const attrs = context().node.attrs as GitHubIssueReferenceAttrs
    const reference = isReferenced()
    if (reference && reference.candidateType) {
      return {
        ...attrs,
        type: reference.candidateType,
      }
    }
    return attrs
  }

  const data = createMemo(() => {
    const link = getLinkFromIssueReferenceAttrs(attrs(), true)
    return {
      link,
      suggestionData: editorContext.suggestionData(),
    }
  })

  const [hoverContent] = createResource(
    data,
    async ({ link, suggestionData }) => {
      const reference = isReferenced()
      if (suggestionData.references.length > 0 && !reference) {
        throw new Error('Not Found')
      }
      if (cacheStorage.get.issueReferencesHtml[link]) {
        return cacheStorage.get.issueReferencesHtml[link]
      }

      const fetchCall =
        attrs().type === 'pull'
          ? getPullRequestHoverCardContent
          : attrs().type === 'discussion'
            ? getDiscussionHoverCardContent
            : getIssueHoverCardContent

      return fetchCall(
        link,
        editorContext.hovercardSubjectTag()!,
        attrs().commentId || null,
      )
        .then((res) => {
          cacheStorage.set('issueReferencesHtml', link, res)
          return res
        })
        .catch((error) => {
          throw error
        })
    },
  )

  const serializedHoverContent = createMemo(() => {
    if (hoverContent.state === 'errored') return null
    const content = hoverContent()
    if (!content) return null
    return new DOMParser().parseFromString(content, 'text/html')
  })

  const issueIcon = createMemo(() => {
    const content = serializedHoverContent()
    if (!content) return null
    const element = content.querySelector<SVGElement>('svg.octicon')
    element && element.classList.add(styles.icon)
    return element
  })

  const issueTitle = createMemo(() => {
    if (hoverContent.state === 'errored') {
      return attrs().fallbackText || String(attrs().issue)
    }
    const content = serializedHoverContent()
    const commentId = attrs().commentId
    if (!content) return null
    const title =
      content.querySelector('.markdown-title')?.textContent ||
      content.querySelector('.dashboard-break-word')?.textContent ||
      attrs().fallbackText ||
      String(attrs().issue)
    if (commentId) {
      return `#${attrs().issue} (comment)`
    }
    return title
  })

  const label = createMemo(() => {
    const { issue, owner, repository } = attrs()
    return `${owner}/${repository}#${issue}`
  })

  return (
    <Show
      fallback={<span>{issueTitle()}</span>}
      when={hoverContent.state !== 'errored'}
    >
      <HoverCard>
        <HoverCardTrigger
          href={data().link}
          target={'_blank'}
          class={styles.trigger}
        >
          <Show when={hoverContent.loading}>
            <LucideLoaderCircle size={15} class={styles.loader} />
          </Show>
          <Show when={issueIcon()}>
            {(icon) => <span class={styles.iconWrapper}>{icon()}</span>}
          </Show>
          <Show fallback={label()} when={issueTitle()}>
            {(title) => (
              <span
                class={clsx(styles.title, {
                  [styles.emptyIcon]: !issueIcon(),
                })}
              >
                {title()}
              </span>
            )}
          </Show>
        </HoverCardTrigger>
        <HoverCardContent>
          <HoverCardArrow />
          <Switch>
            <Match when={hoverContent.state === 'errored'}>
              Cannot retrieve content
            </Match>
            <Match when={hoverContent.loading}>Loading...</Match>
            <Match when={hoverContent.state === 'ready'}>
              <Show when={hoverContent()}>
                {(hoverContent) => <div innerHTML={hoverContent()} />}
              </Show>
            </Match>
          </Switch>
        </HoverCardContent>
      </HoverCard>
    </Show>
  )
}
