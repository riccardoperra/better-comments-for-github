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

import { render } from 'solid-js/web'
import { Editor, EditorRootContext } from './editor/editor'
import type { EditorType } from './editor/editor'
import type { GitHubUploaderHandler } from './core/editor/image/github-file-uploader'
import type { SuggestionData } from './editor/utils/loadSuggestionData'

export interface RenderEditorProps {
  suggestionData: SuggestionData
  initialValue: string
  uploadHandler: GitHubUploaderHandler
  textarea: HTMLTextAreaElement
  type: EditorType
}

export function mountEditor(root: HTMLElement, props: RenderEditorProps) {
  return render(
    () => (
      <div
        data-github-better-comment-wrapper=""
        on:keydown={(event) => {
          event.stopPropagation()
        }}
      >
        <EditorRootContext.Provider
          value={{
            get data() {
              return props.suggestionData
            },
            get uploadHandler() {
              return props.uploadHandler
            },
            get initialValue() {
              return props.textarea.value
            },
            get textarea() {
              return props.textarea
            },
            get type() {
              return props.type
            },
          }}
        >
          <Editor
            type={props.type}
            suggestions={props.suggestionData}
            textarea={props.textarea}
            initialValue={props.textarea.value}
          />
        </EditorRootContext.Provider>
      </div>
    ),
    root,
  )
}
