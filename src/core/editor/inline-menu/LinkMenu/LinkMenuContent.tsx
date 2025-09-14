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
import { Show, createMemo, createSignal } from 'solid-js'
import LucideUnlink from 'lucide-solid/icons/unlink'
import LucideCircleX from 'lucide-solid/icons/circle-x'
import { TextField } from '../../../ui/text-field/text-field'
import { ToolbarAction } from '../../toolbar/toolbar'
import styles from './LinkMenuContent.module.css'
import type { EditorState } from 'prosekit/pm/state'
import type { LinkAttrs } from '@prosedoc/markdown-schema'
import type { EditorExtension } from '../../extension'

export interface LucideMenuContentProps {
  onBack: () => void
}

export const LinkMenuContent = (props: LucideMenuContentProps) => {
  const editor = useEditor<EditorExtension>()

  const getCurrentLink = (state: EditorState): LinkAttrs | undefined => {
    const { $from } = state.selection
    const marks = $from.marksAcross($from)
    if (!marks) {
      return
    }
    for (const mark of marks) {
      if (mark.type.name === 'link') {
        return mark.attrs as LinkAttrs
      }
    }
  }

  const linkHref = createMemo(() => getCurrentLink(editor().state)?.href)

  const [link, setLinkHref] = createSignal(linkHref())

  const handleLinkUpdate = (href?: string) => {
    if (href) {
      editor().commands.addLink({ href })
    } else {
      editor().commands.removeLink()
    }

    props.onBack()
    editor().focus()
  }

  return (
    <div class={styles.content}>
      <form
        class={styles.form}
        onSubmit={(event) => {
          event.preventDefault()
          handleLinkUpdate(link())
        }}
      >
        <TextField
          fit
          placeholder={'Paste link e.g. github.com'}
          value={link()}
          onValueChange={setLinkHref}
          ref={(el) => setTimeout(() => el.focus())}
        />
      </form>

      <ToolbarAction
        isPressed={false}
        disabled={false}
        label={'Go back'}
        onClick={() => props.onBack()}
      >
        <LucideCircleX size={15} />
      </ToolbarAction>

      <Show when={editor().marks.link.isActive()}>
        <ToolbarAction
          isPressed={false}
          disabled={false}
          label={'Unlink'}
          onClick={() => handleLinkUpdate()}
        >
          <LucideUnlink size={15} />
        </ToolbarAction>
      </Show>
    </div>
  )
}
