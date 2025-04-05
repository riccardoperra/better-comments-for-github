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

import { mergeProps, render } from 'solid-js/web'
import { StateProvider } from 'statebuilder'
import { Show } from 'solid-js'
import { clsx } from 'clsx'
import { Editor, EditorRootContext } from './editor/editor'
import type { Accessor } from 'solid-js'
import type { EditorType } from './editor/editor'
import type { GitHubUploaderHandler } from './core/editor/image/github-file-uploader'
import type { SuggestionData } from './editor/utils/loadSuggestionData'

export interface RenderEditorProps {
  open?: boolean
  currentUsername: Accessor<string>
  suggestionData: Accessor<SuggestionData>
  initialValue: string
  uploadHandler: GitHubUploaderHandler
  textarea: () => HTMLTextAreaElement
  type: EditorType
  owner: string
  repository: string
}

export function SwitchButton(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
  size?: 'small' | 'medium'
  variant?: 'invisible' | 'secondary'
}) {
  const mergedProps = mergeProps({ size: 'small', variant: 'invisible' }, props)

  const label = () =>
    props.open ? 'Back to default editor' : 'Switch to a better editor'

  return (
    <button
      type={'button'}
      class={clsx('Button mr-2', {
        'Button--small': mergedProps.size === 'small',
        'Button--medium': mergedProps.size === 'medium',
        'Button--secondary': mergedProps.variant === 'secondary',
        'Button--invisible': mergedProps.variant === 'invisible',
      })}
      onClick={() => mergedProps.onOpenChange(!mergedProps.open)}
    >
      <span
        class={clsx({ 'fgColor-muted': mergedProps.variant === 'invisible' })}
      >
        {label()}
      </span>
    </button>
  )
}

export function mountEditor(root: HTMLElement, props: RenderEditorProps) {
  return render(() => {
    return (
      <StateProvider>
        <Show when={props.open !== false}>
          <div
            data-github-better-comment-wrapper=""
            on:keydown={(event) => {
              event.stopPropagation()
            }}
          >
            <EditorRootContext.Provider
              value={{
                currentUsername: props.currentUsername,
                get data() {
                  return props.suggestionData()
                },
                get uploadHandler() {
                  return props.uploadHandler
                },
                get initialValue() {
                  return props.textarea().value
                },
                get textarea() {
                  return props.textarea()
                },
                get type() {
                  return props.type
                },
                get repository() {
                  return props.repository
                },
                get owner() {
                  return props.owner
                },
              }}
            >
              <Editor
                type={props.type}
                textarea={props.textarea()}
                suggestions={props.suggestionData()}
                initialValue={props.textarea().value}
              />
            </EditorRootContext.Provider>
          </div>
        </Show>
      </StateProvider>
    )
  }, root)
}
