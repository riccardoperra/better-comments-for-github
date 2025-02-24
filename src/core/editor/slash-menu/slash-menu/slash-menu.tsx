import { useEditor } from 'prosekit/solid'
import {
  AutocompleteEmpty,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopover,
} from 'prosekit/solid/autocomplete'

import LucideHeading1 from 'lucide-solid/icons/heading-1'
import LucideHeading2 from 'lucide-solid/icons/heading-2'
import LucideHeading3 from 'lucide-solid/icons/heading-3'
import LucideHeading4 from 'lucide-solid/icons/heading-4'
import LucideHeading5 from 'lucide-solid/icons/heading-5'
import LucideHeading6 from 'lucide-solid/icons/heading-6'
import LucideList from 'lucide-solid/icons/list'
import LucideListCollapse from 'lucide-solid/icons/list-collapse'
import LucideQuote from 'lucide-solid/icons/text-quote'
import LucideDivider from 'lucide-solid/icons/minus'
import LucideListOrdered from 'lucide-solid/icons/list-ordered'
import LucideCodeBlock from 'lucide-solid/icons/code-square'
import { For, Show } from 'solid-js'

import { githubAlertTypeMap } from '../../githubAlert/config'
import styles from './slash-menu.module.css'
import type { JSX } from 'solid-js'
import type { LucideProps } from 'lucide-solid'

import type { EditorExtension } from '../../extension'

import type { Editor } from 'prosekit/core'

export interface SlashMenuItem {
  label: string
  canExec: (editor: Editor<EditorExtension>) => boolean
  command: (editor: Editor<EditorExtension>) => void
  icon?: (props: LucideProps) => JSX.Element
  sectionId?: string
  shortcut?: string
}

const icons = [
  LucideHeading1,
  LucideHeading2,
  LucideHeading3,
  LucideHeading4,
  LucideHeading5,
  LucideHeading6,
]

const SlashMenuItems: Array<SlashMenuItem> = [
  ...[1, 2, 3, 4, 5, 6].map(
    (level) =>
      ({
        label: `Heading ${level}`,
        canExec: (editor) => editor.commands.toggleHeading.canExec({ level }),
        command: (editor) => editor.commands.setHeading({ level: level }),
        icon: icons[level - 1],
        shortcut: '#'.repeat(level),
      }) as SlashMenuItem,
  ),
  {
    label: 'Horizontal divider',
    canExec: (editor) => editor.commands.insertHorizontalRule.canExec(),
    command: (editor) => editor.commands.insertHorizontalRule(),
    shortcut: '---',
    icon: LucideDivider,
  },
  ...[
    { label: 'Task', kind: 'task', shortcut: '[]', icon: LucideList },
    { label: 'Bullet', kind: 'bullet', shortcut: '[]', icon: LucideList },
    {
      label: 'Numbered',
      kind: 'ordered',
      shortcut: '[]',
      icon: LucideListOrdered,
    },
    {
      label: 'Toggle',
      kind: 'toggle',
      shortcut: '>>',
      icon: LucideListCollapse,
    },
  ].map(
    (listType) =>
      ({
        label: `${listType.label} list`,
        command: (editor) =>
          editor.commands.wrapInList({ kind: listType.kind }),
        icon: listType.icon,
        shortcut: listType.shortcut,
        canExec: (editor) =>
          editor.commands.wrapInList.canExec({ kind: listType.kind }),
        sectionId: 'list',
      }) satisfies SlashMenuItem,
  ),
  {
    label: 'Blockquote',
    command: (editor) => editor.commands.toggleBlockquote(),
    canExec: (editor) => editor.commands.toggleBlockquote.canExec(),
    icon: LucideQuote,
    shortcut: '>',
  },
  ...Object.values(githubAlertTypeMap).map(
    (alert) =>
      ({
        label: `${alert.label}`,
        icon: alert.icon,
        shortcut: `>${alert.label}`,
        command: (editor) => editor.commands.setAlert(alert.type),
        canExec: (editor) => editor.commands.toggleAlert.canExec(alert.type),
        sectionId: 'alerts',
      }) satisfies SlashMenuItem,
  ),
  {
    label: 'Code block',
    command: (editor) => editor.commands.toggleCodeBlock(),
    canExec: (editor) => editor.commands.toggleCodeBlock.canExec(),
    icon: LucideCodeBlock,
    shortcut: '```',
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
  return (
    <AutocompletePopover
      regex={/(?:^|(?<=\s))\/(?!\/)[^/]*$/iu}
      class={styles.slashMenu}
      fitViewport={false}
    >
      <AutocompleteList>
        <AutocompleteEmpty>No results</AutocompleteEmpty>

        <div class={styles.slashMenuSectionGroup}>
          <For each={GroupedMenuItems}>
            {(group) => (
              <div class={styles.slashMenuSection}>
                <h5 class={styles.slashMenuSectionTitle}>
                  {group.section.title}
                </h5>

                <For each={group.children}>
                  {(item) => (
                    <Show when={item.canExec(editor())}>
                      <AutocompleteItem
                        class={styles.slashMenuItem}
                        value={item.label}
                        onSelect={() => item.command(editor())}
                      >
                        <Show when={item.icon}>
                          {(icon) => {
                            const Icon = icon()
                            return <Icon size={17} strokeWidth={2} />
                          }}
                        </Show>
                        {item.label}

                        <Show when={item.shortcut}>
                          <span class={styles.slashMenuItemShortcut}>
                            {item.shortcut}
                          </span>
                        </Show>
                      </AutocompleteItem>
                    </Show>
                  )}
                </For>
              </div>
            )}
          </For>
        </div>
      </AutocompleteList>
    </AutocompletePopover>
  )
}
