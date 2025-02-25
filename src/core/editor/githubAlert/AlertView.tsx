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
import { Dynamic } from 'solid-js/web'
import { For, Show, createMemo } from 'solid-js'
import { clsx } from 'clsx'
import LucideChevronDown from 'lucide-solid/icons/chevron-down'
import { NodeViewWrapper } from '../nodeviews/node-view'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '../dropdown-menu/dropdown-menu'
import { githubAlertTypeKeys, githubAlertTypeMap } from './config'
import styles from './AlertView.module.css'
import type { GithubAlertType } from './config'
import type { NodeViewContextProps } from '@prosemirror-adapter/solid'

export function AlertView(props: NodeViewContextProps) {
  const context = useNodeViewContext()

  const selectedType = createMemo(
    () => context().node.attrs.type as GithubAlertType,
  )

  return (
    <NodeViewWrapper>
      <div
        class={`markdown-alert markdown-alert-${context().node.attrs.type}`}
        dir={'auto'}
      >
        <Show when={githubAlertTypeMap[selectedType()]}>
          {(data) => (
            <p
              class={clsx(styles.gitHubAlertTitle, 'markdown-alert-title')}
              dir={'auto'}
            >
              <DropdownMenu>
                <DropdownMenuTrigger class={styles.gitHubAlertSwitchButton}>
                  <Dynamic component={data().icon} />
                  {data().label}

                  <LucideChevronDown size={12} />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuRadioGroup
                    value={selectedType()}
                    onChange={(value) => context().setAttrs({ type: value })}
                  >
                    <For each={githubAlertTypeKeys}>
                      {(key) => (
                        <DropdownMenuRadioItem value={key}>
                          {githubAlertTypeMap[key].label}
                        </DropdownMenuRadioItem>
                      )}
                    </For>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </p>
          )}
        </Show>
        <div ref={props.contentRef} class={`${styles.gitHubAlertParagraph}`} />
      </div>
    </NodeViewWrapper>
  )
}
