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

import { defineStore } from 'statebuilder'
import { emitter } from './editor/utils/emitter'
import type { Editor } from 'prosekit/core'
import type { EditorExtension } from './core/editor/extension'
import type { EditorState } from 'prosekit/pm/state'

export interface ExtensionEditorState {
  markdown: string
  nodeString: string
}

export interface EditorEvents {
  'editor::state-update': (editor: EditorState) => void
}

export const ExtensionEditorStore = defineStore<ExtensionEditorState>(() => ({
  markdown: '',
  nodeString: '',
})).extend((_) => {
  let instance: Editor<EditorExtension>
  const eventEmitter = emitter<EditorEvents>()

  return {
    emitter: eventEmitter,
    get instance() {
      return instance
    },
    setInstance(_: Editor<EditorExtension>) {
      instance = _
    },
  }
})
