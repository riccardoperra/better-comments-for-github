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

import LucideBold from 'lucide-solid/icons/bold'
import LucideItalic from 'lucide-solid/icons/italic'
import LucideStrike from 'lucide-solid/icons/strikethrough'
import LucideCode from 'lucide-solid/icons/code'
import { Show } from 'solid-js'
import LucideLink from 'lucide-solid/icons/link'
import { useEditor } from 'prosekit/solid'
import { ToolbarAction as Button } from '../../toolbar/toolbar'
import type { EditorExtension } from '../../extension'

export interface BaseMenuProps {
  toggleLink: () => void
}

export const BaseMenu = (props: BaseMenuProps) => {
  const editor = useEditor<EditorExtension>()
  return (
    <>
      <Button
        isPressed={editor().marks.bold.isActive()}
        disabled={!editor().commands.toggleBold.canExec()}
        onClick={() => editor().commands.toggleBold()}
        label="Bold"
      >
        <LucideBold size={16} />
      </Button>

      <Button
        isPressed={editor().marks.italic.isActive()}
        disabled={!editor().commands.toggleItalic.canExec()}
        onClick={() => editor().commands.toggleItalic()}
        label="Italic"
      >
        <LucideItalic size={16} />
      </Button>

      <Button
        isPressed={editor().marks.strike.isActive()}
        disabled={!editor().commands.toggleStrike.canExec()}
        onClick={() => editor().commands.toggleStrike()}
        label="Strikethrough"
      >
        <LucideStrike size={16} />
      </Button>

      <Button
        isPressed={editor().marks.code.isActive()}
        disabled={!editor().commands.toggleCode.canExec()}
        onClick={() => editor().commands.toggleCode()}
        label="Code"
      >
        <LucideCode size={16} />
      </Button>

      <Show when={editor().commands.addLink.canExec({ href: '' })}>
        <Button
          disabled={false}
          isPressed={editor().marks.link.isActive()}
          onClick={() => {
            editor().commands.expandLink()
            props.toggleLink()
          }}
          label="Link"
        >
          <LucideLink size={16} />
        </Button>
      </Show>
    </>
  )
}
