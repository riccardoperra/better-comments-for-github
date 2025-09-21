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

import { ErrorBoundary, mergeProps, render } from 'solid-js/web'
import { StateProvider } from 'statebuilder'
import { Show, onMount } from 'solid-js'
import { clsx } from 'clsx'
import { Editor, EditorRootContext } from './editor/editor'
import { OcticonCaution } from './core/custom/githubAlert/icons'
import { ConfigStore } from './config.store'
import type { EditorType } from './editor/editor'
import type { Accessor } from 'solid-js'
import type { GitHubUploaderHandler } from './core/custom/image/github-file-uploader'
import type { SuggestionData } from './editor/utils/loadSuggestionData'

export interface RenderEditorProps {
  id: string
  open: Accessor<boolean>
  openChange: (open: boolean) => void
  currentUsername: Accessor<string | null>
  suggestionData: Accessor<SuggestionData>
  initialValue: string
  uploadHandler: GitHubUploaderHandler
  textarea: () => HTMLTextAreaElement | null
  type: EditorType
  owner: Accessor<string | null>
  repository: Accessor<string | null>
  hovercardSubjectTag: Accessor<string | null>
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
      // NOTE: For some reason delegated events it doesn't work in some pages
      // (https://github.com/riccardoperra/better-comments-for-github/issues/39)
      // so for now we will use native event
      on:click={() => mergedProps.onOpenChange(!mergedProps.open)}
    >
      <span
        class={clsx({ 'fgColor-muted': mergedProps.variant === 'invisible' })}
      >
        {label()}
      </span>
    </button>
  )
}

export interface EditorErrorBoundaryProps {
  error?: any
  reload: () => void
  close: () => void
}

export function EditorErrorBoundary(props: EditorErrorBoundaryProps) {
  const configStore = ConfigStore.provide()

  const issueUrl = () => configStore.get.newIssueUrl

  onMount(() => {
    if (props.error) {
      console.error(props.error)
    }
  })

  return (
    <div class={'Banner Banner--error'}>
      <div class={'Banner-visual'}>
        <OcticonCaution />
      </div>

      <div class={'Banner-message'}>
        <p class={'Banner-title'}>
          Something went wrong while rendering the editor. Please try again. If
          the problem persist, please{' '}
          <a href={issueUrl()} target={'_blank'} class={'Link--inTextBlock'}>
            open an issue
          </a>
          .
        </p>
        <br />
        <p>{props.error.toString()}</p>
        <button class={'Button Button--danger mt-2'} onClick={props.reload}>
          Try reload
        </button>
      </div>
    </div>
  )
}

export function mountEditor(root: HTMLElement, props: RenderEditorProps) {
  return render(() => {
    return (
      <StateProvider>
        <Show when={props.open()}>
          <ErrorBoundary
            fallback={(err, reload) => (
              <EditorErrorBoundary
                error={err}
                reload={reload}
                close={() => props.openChange(false)}
              />
            )}
          >
            <div
              data-github-better-comment-wrapper=""
              on:keydown={(event) => {
                event.stopPropagation()
              }}
            >
              <EditorRootContext.Provider
                value={{
                  id: props.id,
                  currentUsername: props.currentUsername,
                  data: props.suggestionData,
                  uploadHandler: props.uploadHandler,
                  get hovercardSubjectTag() {
                    return props.hovercardSubjectTag
                  },
                  get initialValue() {
                    return props.initialValue
                  },
                  textarea: () => props.textarea()!,
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
                  suggestions={props.suggestionData()}
                />
              </EditorRootContext.Provider>
            </div>
          </ErrorBoundary>
        </Show>
      </StateProvider>
    )
  }, root)
}
