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

import { For, Match, Show, Switch } from 'solid-js'
import { clsx } from 'clsx'
import { EditorActionConfig } from '../../../actions'
import styles from './kbd.module.css'

export interface EditorTextShortcutProps {
  element: string
  type: 'keyboard' | 'inputRule'
}

export function EditorTextShortcut(props: EditorTextShortcutProps) {
  const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform)

  const config = () => EditorActionConfig[props.element]

  const label = () => {
    if (!config()) return null
    const { shortcuts } = config()
    const type = props.type
    switch (type) {
      case 'inputRule':
        return shortcuts[1]
      case 'keyboard': {
        const k = shortcuts[0]
        return typeof k === 'string'
          ? k.split('-')
          : Array.isArray(k)
            ? k[0].split('-')
            : k
      }
    }
  }

  return (
    <span class={styles.editorTextShortcut}>
      <Show when={label()}>
        {(label) => (
          <Show
            fallback={
              <>
                <For each={label() as Array<string>}>
                  {(item, index) => (
                    <>
                      <Switch>
                        <Match when={item === 'Mod' || item === 'mod'}>
                          <Show fallback={<>Ctrl</>} when={isMac}>
                            ⌘
                          </Show>
                        </Match>
                        <Match when={true}>
                          <span
                            class={clsx({
                              [styles.char]: item.length === 1,
                            })}
                          >
                            {item}
                          </span>
                        </Match>
                      </Switch>
                      <Show
                        when={
                          label().length > 2 && index() < label().length - 1
                        }
                      >
                        +
                      </Show>
                    </>
                  )}
                </For>
              </>
            }
            when={props.type === 'inputRule'}
          >
            {label()}
          </Show>
        )}
      </Show>
    </span>
  )
}
