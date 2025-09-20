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

import { For, Index, Show, createMemo, createSignal } from 'solid-js'
import { canUseRegexLookbehind } from 'prosekit/core'
import clsx from 'clsx'
import {
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopover,
} from '../autocomplete/Autocomplete'

import { githubAlertTypeMap } from '../../custom/githubAlert/config'
import { EditorTextShortcut } from '../../ui/kbd/kbd'
import { EditorActionIcon } from '../../ui/action-icon/ActionIcon'
import styles from './slash-menu.module.css'
import { DynamicSizedContainer } from './DynamicSIzedContainer'
import type { Editor } from 'prosekit/core'
import type { JSX } from 'solid-js'
import type { LucideProps } from 'lucide-solid'

import type { EditorExtension } from '../extension'

export interface SlashMenuItem {
  label: string
  canExec: (editor: Editor<EditorExtension>) => boolean
  command: (editor: Editor<EditorExtension>) => void
  icon?: (props: LucideProps) => JSX.Element
  sectionId?: string
  shortcut?: string
  actionId?: string
}

const SlashMenuItems: Array<SlashMenuItem> = [
  ...[1, 2, 3, 4, 5, 6].map(
    (level) =>
      ({
        label: `Heading ${level}`,
        canExec: (editor) => editor.commands.toggleHeading.canExec({ level }),
        command: (editor) => editor.commands.setHeading({ level: level }),
        actionId: `heading>${level}`,
      }) as SlashMenuItem,
  ),
  {
    label: 'Horizontal divider',
    canExec: (editor) => editor.commands.insertHorizontalRule.canExec(),
    command: (editor) => editor.commands.insertHorizontalRule(),
    actionId: 'horizontalRule',
  },
  ...[
    {
      label: 'Task',
      actionId: 'taskList',
      kind: 'task',
    },
    {
      label: 'Bullet',
      actionId: 'bulletList',
      kind: 'bullet',
    },
    {
      label: 'Numbered',
      kind: 'ordered',
    },
  ].map(
    (listType) =>
      ({
        label: `${listType.label} list`,
        command: (editor) =>
          editor.commands.wrapInList({ kind: listType.kind }),
        actionId: `${listType.kind}List`,
        canExec: (editor) =>
          editor.commands.wrapInList.canExec({ kind: listType.kind }),
        sectionId: 'list',
      }) satisfies SlashMenuItem,
  ),
  {
    label: 'Blockquote',
    command: (editor) => editor.commands.toggleBlockquote(),
    canExec: (editor) => editor.commands.toggleBlockquote.canExec(),
    actionId: 'blockquote',
  },
  ...Object.values(githubAlertTypeMap).map(
    (alert) =>
      ({
        label: `${alert.label}`,
        actionId: `alert>${alert.type}`,
        command: (editor) => editor.commands.setAlert(alert.type),
        canExec: (editor) => editor.commands.toggleAlert.canExec(alert.type),
        sectionId: 'alerts',
      }) satisfies SlashMenuItem,
  ),
  {
    label: 'Code block',
    command: (editor) => editor.commands.toggleCodeBlock(),
    canExec: (editor) => editor.commands.toggleCodeBlock.canExec(),
    actionId: 'codeBlock',
  },
  {
    label: 'Details',
    command: (editor) => editor.commands.insertDetails(),
    canExec: (editor) => editor.commands.insertDetails.canExec(),
    actionId: 'details',
  },
]

type SlashMenuSection = {
  id: string
  title: string
}

const slashMenuSectionConfig: Record<string, SlashMenuSection> = {
  alerts: {
    id: 'alerts',
    title: 'Alerts',
  },
  base: {
    id: 'base',
    title: 'Basic blocks',
  },
  list: {
    id: 'list',
    title: 'List blocks',
  },
}

function groupMenuItems() {
  const map: { [sectionId: string]: Array<SlashMenuItem> } = {}
  const result: Array<{
    section: SlashMenuSection
    children: Array<SlashMenuItem>
  }> = []
  for (const menuItem of SlashMenuItems) {
    const section = menuItem.sectionId ?? 'base'

    if (!map[section]) {
      const array = [] as Array<SlashMenuItem>
      map[section] = array
      result.push({
        section: slashMenuSectionConfig[section],
        children: array,
      })
    }

    map[section].push(menuItem)
  }

  return result
}

const GroupedMenuItems = groupMenuItems()

export default function SlashMenu() {
  const editor = useEditor<EditorExtension>()
  const [query, setQuery] = createSignal('')
  // Match inputs like "/", "/table", "/heading 1" etc. Do not match "/ heading".
  const regex = canUseRegexLookbehind() ? /(?<!\S)\/(|\S.*)$/u : /\/(|\S.*)$/u

  const filteredMenuItems = createMemo(() => {
    const currentQuery = query()
    const updatedGroupedMenuItems: typeof GroupedMenuItems = []
    for (const group of GroupedMenuItems) {
      const items: Array<SlashMenuItem> = []
      for (const item of group.children) {
        if (item.label.toLowerCase().includes(currentQuery)) {
          items.push(item)
        }
      }
      if (items.length > 0) {
        updatedGroupedMenuItems.push({
          section: group.section,
          children: items,
        })
      }
    }
    return updatedGroupedMenuItems
  })

  return (
    <AutocompletePopover
      regex={regex}
      fitViewport={false}
      placement={'bottom-start'}
      strategy={'fixed'}
      class={clsx(styles.slashMenu, {
        [styles.emptySlashMenu]: filteredMenuItems().length === 0,
      })}
      onQueryChange={setQuery}
      autoUpdate={true}
    >
      <AutocompleteList>
        <DynamicSizedContainer>
          <div class={styles.slashMenuSectionGroup}>
            <Index each={filteredMenuItems()}>
              {(group) => (
                <div class={styles.slashMenuSection}>
                  <h5 class={styles.slashMenuSectionTitle}>
                    {group().section.title}
                  </h5>

                  <For each={group().children}>
                    {(item) => (
                      <Show when={item.canExec(editor())}>
                        <AutocompleteItem
                          key={item.actionId!}
                          class={styles.slashMenuItem}
                          value={item.label}
                          onSelect={() => {
                            item.command(editor())
                          }}
                        >
                          <Show
                            fallback={
                              <>
                                <Show when={item.icon}>
                                  {(icon) => {
                                    const Icon = icon()
                                    return <Icon size={17} strokeWidth={2} />
                                  }}
                                </Show>
                              </>
                            }
                            when={item.actionId}
                          >
                            {(actionId) => (
                              <EditorActionIcon
                                actionId={actionId()}
                                size={17}
                              />
                            )}
                          </Show>

                          {item.label}

                          <Show when={item.actionId}>
                            <span class={styles.slashMenuItemShortcut}>
                              <EditorTextShortcut
                                element={item.actionId!}
                                type={'inputRule'}
                              />
                            </span>
                          </Show>
                        </AutocompleteItem>
                      </Show>
                    )}
                  </For>
                </div>
              )}
            </Index>
          </div>
        </DynamicSizedContainer>
      </AutocompleteList>
    </AutocompletePopover>
  )
}
