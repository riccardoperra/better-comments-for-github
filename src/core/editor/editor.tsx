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

import { ProseKit } from 'prosekit/solid'
import { Toolbar } from './toolbar/toolbar'
import styles from './editor.module.css'
import { UserMentionMenu } from './user-mention/UserMentionMenu'
import { IssueReferenceMenu } from './issue-reference/IssueReferenceMenu/IssueReferenceMenu'
import { EditorBlockHandler } from './block-handle/block-handle'
import InlineMenu from './inline-menu/InlineMenu'
import EmojiMenu from './emoji-menu/emoji-menu'
import SlashMenu from './slash-menu/slash-menu'
import type { Editor } from 'prosekit/core'
import type { SuggestionData } from '../../editor/utils/loadSuggestionData'

export interface ProsekitEditor {
  editor: Editor
  emojis: SuggestionData['emojis']
  mentions: SuggestionData['mentions']
  issues: SuggestionData['references']
}

export function ProsekitEditor(props: ProsekitEditor) {
  return (
    <ProseKit editor={props.editor}>
      <div class={styles.Editor}>
        <div class={styles.EditorContent}>
          <Toolbar />

          <div
            ref={props.editor.mount}
            class={`markdown-body ${styles.EditorTextarea}`}
          />

          <SlashMenu />
          <EmojiMenu emojis={props.emojis} />

          <UserMentionMenu users={props.mentions} />
          <IssueReferenceMenu issues={props.issues} />
          <InlineMenu />
          <EditorBlockHandler />
        </div>
      </div>
    </ProseKit>
  )
}
