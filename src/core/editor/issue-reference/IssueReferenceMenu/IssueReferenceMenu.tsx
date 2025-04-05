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
} from '../../autocomplete/Autocomplete'
import styles from './IssueReferenceMenu.module.css'
import type { EditorExtension } from '../../extension'
import type { SuggestionData } from '../../../../editor/utils/loadSuggestionData'

export interface UserMentionMenuProps {
  issues: SuggestionData['references']
}

export function IssueReferenceMenu(props: UserMentionMenuProps) {
  const [query, setQuery] = createSignal('')
  const editor = useEditor<EditorExtension>()

  const handleIssueReferenceInsert = (
    ref: SuggestionData['references'][number],
  ) => {
    const isPullRequest = ref.iconHtml.includes('pull-request')
    const [, owner, repository] = window.location.pathname.split('/')
    if (owner && repository) {
      queueMicrotask(() => {
        editor().commands.insertGitHubIssueReference({
          owner,
          repository,
          issue: ref.id,
          type: isPullRequest ? 'pull' : 'issue',
        })
      })
    }
  }

  const filteredUsers = createMemo(() => {
    const filter = query()

    if (!filter) {
      return props.issues.slice(0, 50)
    }

    return props.issues
      .filter(
        (issue) =>
          issue.titleText.toLowerCase().includes(filter.toLowerCase()) ||
          String(issue.id).includes(filter),
      )
      .slice(0, 100)
  })

  return (
    <AutocompletePopover
      regex={/#\w?(.*)/}
      fitViewport={false}
      transform={true}
      onQueryChange={setQuery}
    >
      <AutocompleteList filter={null}>
        <AutocompleteEmpty>No results</AutocompleteEmpty>

        <For each={filteredUsers()}>
          {(issue) => (
            <AutocompleteItem
              onSelect={() => handleIssueReferenceInsert(issue)}
            >
              <div class={styles.itemContainer}>
                <div innerHTML={issue.iconHtml}></div>

                <div
                  innerHTML={issue.titleHtml}
                  class={styles.referenceTitle}
                ></div>

                <small class={styles.referenceId}>#{issue.id}</small>
              </div>
            </AutocompleteItem>
          )}
        </For>
      </AutocompleteList>
    </AutocompletePopover>
  )
}
