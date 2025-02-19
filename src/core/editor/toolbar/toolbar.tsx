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
import LucideBold from 'lucide-solid/icons/bold'
import LucideItalic from 'lucide-solid/icons/italic'
import LucideStrike from 'lucide-solid/icons/strikethrough'
import LucideCode from 'lucide-solid/icons/code'
import LucideCodeBlock from 'lucide-solid/icons/code-square'
import LucideBlockquote from 'lucide-solid/icons/text-quote'
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
        data-pressed={editor().marks.bold.isActive()}
        disabled={!editor().commands.toggleBold.canExec()}
        onClick={() => editor().commands.toggleBold()}
      >
        <LucideBold size={16} />
      </button>
      <button
        data-pressed={editor().marks.italic.isActive()}
        class={styles.ToolbarAction}
        disabled={!editor().commands.toggleItalic.canExec()}
        onClick={() => editor().commands.toggleItalic()}
      >
        <LucideItalic size={16} />
      </button>
      <button
        data-pressed={editor().marks.strike.isActive()}
        class={styles.ToolbarAction}
        disabled={!editor().commands.toggleStrike.canExec()}
        onClick={() => editor().commands.toggleStrike()}
      >
        <LucideStrike size={16} />
      </button>

      <div class={styles.Separator}></div>

      <button
        class={styles.ToolbarAction}
        data-pressed={editor().nodes.codeBlock.isActive()}
        disabled={!editor().commands.toggleCodeBlock.canExec()}
        onClick={() => editor().commands.toggleCodeBlock()}
      >
        <LucideCodeBlock size={16} />
      </button>

      <button
        class={styles.ToolbarAction}
        data-pressed={editor().nodes.blockquote.isActive()}
        disabled={!editor().commands.toggleBlockquote.canExec()}
        onClick={() => editor().commands.toggleBlockquote()}
      >
        <LucideBlockquote size={16} />
      </button>

      <button
        class={styles.ToolbarAction}
        data-pressed={editor().nodes.blockquote.isActive()}
        disabled={!editor().commands.toggleCode.canExec()}
        onClick={() => editor().commands.toggleCode()}
      >
        <LucideCode size={16} />
      </button>

      {/* <button*/}
      {/*  data-pressed={isTextAlignActive('center')}*/}
      {/*  class={styles.ToolbarAction}*/}
      {/*  disabled={!editor().commands.setTextAlign.canExec('left')}*/}
      {/*  onClick={() => editor().commands.setTextAlign('left')}*/}
      {/* >*/}
      {/*  Align left*/}
      {/* </button>*/}

      {/* <button*/}
      {/*  class={styles.ToolbarAction}*/}
      {/*  data-pressed={isTextAlignActive('center')}*/}
      {/*  disabled={!editor().commands.setTextAlign.canExec('center')}*/}
      {/*  onClick={() => editor().commands.setTextAlign('center')}*/}
      {/* >*/}
      {/*  Align center*/}
      {/* </button>*/}

      {/* <button*/}
      {/*  class={styles.ToolbarAction}*/}
      {/*  data-pressed={isTextAlignActive('right')}*/}
      {/*  disabled={!editor().commands.setTextAlign.canExec('right')}*/}
      {/*  onClick={() => editor().commands.setTextAlign('right')}*/}
      {/* >*/}
      {/*  Align right*/}
      {/* </button>*/}
    </div>
  )
}
