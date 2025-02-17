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
import styles from './toolbar.module.css'
import type { NodeAction } from 'prosekit/core'
import type { EditorExtension } from '../extension'

export function Toolbar() {
  const editor = useEditor<EditorExtension>({ update: true })

  const isTextAlignActive = (value: string) => {
    return Object.values(editor().nodes).some((node: NodeAction<any>) => {
      return node.isActive({ textAlign: value })
    })
  }

  return (
    <div class={styles.Toolbar}>
      <button
        class={styles.ToolbarAction}
        data-pressed={editor().nodes.codeBlock.isActive}
        disabled={!editor().commands.setCodeBlock.canExec()}
        onClick={() => editor().commands.setCodeBlock()}
      >
        Code block
      </button>

      <button
        class={styles.ToolbarAction}
        data-pressed={editor().marks.bold.isActive()}
        disabled={!editor().commands.toggleBold.canExec()}
        onClick={() => editor().commands.toggleBold()}
      >
        Bold
      </button>
      <button
        data-pressed={editor().marks.italic.isActive()}
        class={styles.ToolbarAction}
        disabled={!editor().commands.toggleItalic.canExec()}
        onClick={() => editor().commands.toggleItalic()}
      >
        Italic
      </button>
      <button
        data-pressed={editor().marks.strike.isActive()}
        class={styles.ToolbarAction}
        disabled={!editor().commands.toggleStrike.canExec()}
        onClick={() => editor().commands.toggleStrike()}
      >
        Strikethrough
      </button>

      <button
        data-pressed={isTextAlignActive('center')}
        class={styles.ToolbarAction}
        disabled={!editor().commands.setTextAlign.canExec('left')}
        onClick={() => editor().commands.setTextAlign('left')}
      >
        Align left
      </button>

      <button
        class={styles.ToolbarAction}
        data-pressed={isTextAlignActive('center')}
        disabled={!editor().commands.setTextAlign.canExec('center')}
        onClick={() => editor().commands.setTextAlign('center')}
      >
        Align center
      </button>

      <button
        class={styles.ToolbarAction}
        data-pressed={isTextAlignActive('right')}
        disabled={!editor().commands.setTextAlign.canExec('right')}
        onClick={() => editor().commands.setTextAlign('right')}
      >
        Align right
      </button>
    </div>
  )
}
