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
  untrack,
} from 'solid-js'

import { CacheStore } from '../../../../cache.store'
import {
  HoverCard,
  HoverCardArrow,
  HoverCardContent,
  HoverCardTrigger,
} from '../../hover-card/HoverCard'
import { getUserHoverCardContent } from '../../../../github/data'
import styles from './UserMentionView.module.css'
import type { NodeViewContextProps } from '@prosemirror-adapter/solid'
import type { MentionAttrs } from 'prosekit/extensions/mention'

export function UserMentionView(props: NodeViewContextProps) {
  const cacheStorage = CacheStore.provide()
  const context = useNodeViewContext()
  const attrs = () => context().node.attrs as MentionAttrs
  const username = createMemo(() => attrs().id)

  const link = createMemo(() => `https://github.com/users/${username()}`)

  const [hoverContent] = createResource(username, (username) => {
    const linkValue = untrack(link)
    if (cacheStorage.get.issueReferencesHtml[linkValue]) {
      return cacheStorage.get.issueReferencesHtml[linkValue]
    }
    return getUserHoverCardContent(username)
      .then((res) => {
        cacheStorage.set('issueReferencesHtml', linkValue, res)
        return res
      })
      .catch((error) => {
        cacheStorage.set('issueReferencesHtml', linkValue, undefined)
        throw error
      })
  })

  const label = createMemo(() => {
    const { id } = attrs()
    console.log(attrs())
    return `@${id}`
  })

  return (
    <HoverCard>
      <Show
        fallback={
          <>
            <HoverCardTrigger
              href={link()}
              target={'_blank'}
              class={styles.trigger}
            >
              {label()}
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
          </>
        }
        when={hoverContent() === 'Not Found'}
      >
        {label()}
      </Show>
    </HoverCard>
  )
}
