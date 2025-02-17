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
  AutocompleteEmpty,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopover,
} from 'prosekit/solid/autocomplete'
import { useEditor } from 'prosekit/solid'
import styles from './UserMentionMenu.module.css'
import type { EditorExtension } from '../extension'
import type { SuggestionData } from '../../../editor/utils/loadSuggestionData'

export interface UserMentionMenuProps {
  users: SuggestionData['mentions']
}

export function UserMentionMenu(props: UserMentionMenuProps) {
  const editor = useEditor<EditorExtension>()

  const handleUserInsert = (user: SuggestionData['mentions'][number]) => {
    console.log(user)
    editor().commands.insertMention({
      id: user.identifier.toString(),
      value: '@' + user.identifier,
      kind: 'user',
    })
    editor().commands.insertText({ text: ' ' })
  }

  return (
    <AutocompletePopover regex={/@\w*$/} class={styles.directiveMenu}>
      <AutocompleteList>
        <AutocompleteEmpty className="relative block min-w-[8rem] scroll-my-1 rounded px-3 py-1.5 box-border cursor-default select-none whitespace-nowrap outline-none data-[focused]:bg-zinc-100 dark:data-[focused]:bg-zinc-800">
          No results
        </AutocompleteEmpty>

        {props.users.map((user) => (
          <AutocompleteItem
            key={user.identifier}
            className={styles.directiveMenuItem}
            onSelect={() => handleUserInsert(user)}
          >
            <img
              src={user.avatarUrl}
              class={styles.directiveMenuItemAvatar}
              alt={''}
            />

            {user.description}
          </AutocompleteItem>
        ))}
      </AutocompleteList>
    </AutocompletePopover>
  )
}
