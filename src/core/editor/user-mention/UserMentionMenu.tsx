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

import { useEditor } from 'prosekit/solid'
import { For, createMemo, createSignal } from 'solid-js'
import {
  AutocompleteEmpty,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopover,
} from '../autocomplete/Autocomplete'
import styles from './UserMentionMenu.module.css'
import type { EditorExtension } from '../extension'
import type { SuggestionData } from '../../../editor/utils/loadSuggestionData'

export interface UserMentionMenuProps {
  users: SuggestionData['mentions']
}

export function UserMentionMenu(props: UserMentionMenuProps) {
  const [query, setQuery] = createSignal('')
  const editor = useEditor<EditorExtension>()

  const handleUserInsert = (user: SuggestionData['mentions'][number]) => {
    editor().commands.insertMention({
      id: user.identifier.toString(),
      value: '@' + user.identifier,
      kind: 'user',
    })
    editor().commands.insertText({ text: ' ' })
  }

  const filteredUsers = createMemo(() => {
    const filter = query()

    if (!filter) {
      return props.users.slice(0, 50)
    }

    return props.users
      .filter((user) => {
        return (
          user.description.includes(filter) || user.identifier.includes(filter)
        )
      })
      .slice(0, 100)
  })

  return (
    <AutocompletePopover
      regex={/@\w*$/}
      fitViewport={false}
      transform={true}
      onQueryChange={setQuery}
    >
      <AutocompleteList filter={null}>
        <AutocompleteEmpty>No results</AutocompleteEmpty>

        <For each={filteredUsers()}>
          {(user) => (
            <AutocompleteItem onSelect={() => handleUserInsert(user)}>
              <img
                src={user.avatarUrl}
                class={styles.directiveMenuItemAvatar}
                alt={''}
              />

              {user.description}
            </AutocompleteItem>
          )}
        </For>
      </AutocompleteList>
    </AutocompletePopover>
  )
}
