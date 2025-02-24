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
import { Match, Show, Switch, createMemo, createResource } from 'solid-js'

import LucideLoaderCircle from 'lucide-solid/icons/loader-circle'
import { CacheStore } from '../../../../cache.store'
import {
  HoverCard,
  HoverCardArrow,
  HoverCardContent,
  HoverCardTrigger,
} from '../../hover-card/HoverCard'
import { getLinkFromIssueReferenceAttrs } from '../issue-reference-utils'
import { getIssueHoverCardContent } from '../../../../github/data'
import styles from './IssueReferenceView.module.css'
import type { GitHubIssueReferenceAttrs } from '../issue'
import type { NodeViewContextProps } from '@prosemirror-adapter/solid'

export function IssueReferenceView(props: NodeViewContextProps) {
  const cacheStorage = CacheStore.provide()
  const context = useNodeViewContext()
  const attrs = () => context().node.attrs as GitHubIssueReferenceAttrs

  const link = createMemo(() => getLinkFromIssueReferenceAttrs(attrs()))

  const [hoverContent] = createResource(link, (link) => {
    if (cacheStorage.get.issueReferencesHtml[link]) {
      return cacheStorage.get.issueReferencesHtml[link]
    }
    return getIssueHoverCardContent(link)
      .then((res) => {
        cacheStorage.set('issueReferencesHtml', link, res)
        return res
      })
      .catch((error) => {
        cacheStorage.set('issueReferencesHtml', link, undefined)
        throw error
      })
  })

  const serializedHoverContent = createMemo(() => {
    const content = hoverContent()
    if (!content) return null
    return new DOMParser().parseFromString(content, 'text/html')
  })

  const issueIcon = createMemo(() => {
    const content = serializedHoverContent()
    if (!content) return null
    return content.querySelector('svg.octicon')
  })

  const issueTitle = createMemo(() => {
    const content = serializedHoverContent()
    if (!content) return null
    return content.querySelector('.markdown-title')?.textContent
  })

  const label = createMemo(() => {
    const { issue, owner, repository } = attrs()
    return `${owner}/${repository}#${issue}`
  })

  return (
    <HoverCard>
      <HoverCardTrigger href={link()} target={'_blank'} class={styles.trigger}>
        <Show when={hoverContent.loading}>
          <LucideLoaderCircle size={15} class={styles.loader} />
        </Show>
        <Show when={issueIcon()}>{(icon) => icon()}</Show>
        <Show fallback={label()} when={issueTitle()}>
          {(title) => title()}
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
  )
}
