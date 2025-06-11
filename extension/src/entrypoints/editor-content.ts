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

import { queryComment } from '@better-comments-for-github/core/dom/queryComment'
import { mountEditor } from '@better-comments-for-github/core/render'
import {
  createGitHubEditorInstance,
  createGitHubPageInstance,
  getGitHubEditorInstanceFromElement,
  registerGitHubEditorInstance,
  removeGitHubEditorInstance,
} from '../utils/githubPageDetector'
import { GitHubNativeTextareaHandler } from '../utils/gitHubNativeTextareaHandler'
import { GitHubEditorInjector } from '../utils/injectEditor'
import { GitHubReactTextareaHandler } from '../utils/gitHubReactTextareaHandler'
import type { EditorType } from '@better-comments-for-github/core/editor/editor'

export default defineUnlistedScript(() => {
  createRoot(() => {
    let observerDisposer: undefined | (() => void)
    let rootDisposer: undefined | (() => void)

    createGitHubPageInstance({
      onDestroy(this) {
        if (observerDisposer) {
          observerDisposer()
          observerDisposer = undefined
        }
        if (rootDisposer) {
          rootDisposer()
          rootDisposer = undefined
        }
        this.removeAllInstances()
      },
      onReady(this) {
        const currentUsername = this.currentUsername
        const parsedUrl = this.parsedUrl
        const repository = () => parsedUrl()?.repository ?? null
        const repositoryOwner = () => parsedUrl()?.repositoryOwner ?? null
        if (observerDisposer) {
          observerDisposer()
          observerDisposer = undefined
        }
        if (rootDisposer) {
          rootDisposer()
          rootDisposer = undefined
        }

        createRoot((_rootDisposer) => {
          rootDisposer = _rootDisposer
          ;[, , , observerDisposer] = queryComment({
            onNodeRemoved: (element) => {
              const instance = getGitHubEditorInstanceFromElement(element)
              if (instance) {
                removeGitHubEditorInstance(this, instance)
              }
            },
            onNodeAdded: (element) => {
              createRoot((dispose) => {
                const editorInstance = createGitHubEditorInstance(
                  element,
                  dispose,
                )
                const editorInjector = new GitHubEditorInjector()
                editorInstance.setInjector(editorInjector)
                registerGitHubEditorInstance(this, editorInstance)

                const {
                  textareaRef,
                  setTextareaRef,
                  showOldEditor,
                  setShowOldEditor,
                  editorElement,
                  suggestionData,
                  setSuggestionData,
                } = editorInstance

                let type: EditorType
                const nativeTextareaHandler = new GitHubNativeTextareaHandler(
                  element,
                  editorInstance,
                )
                const reactTextareaHandler = new GitHubReactTextareaHandler(
                  element,
                  editorInstance,
                )

                // Old comment component of GitHub, This is still present in pull requests
                const jsCommentField = nativeTextareaHandler.findTextarea()
                if (jsCommentField) {
                  type = 'native'
                  setTextareaRef(jsCommentField)

                  editorInjector.findTextarea = () =>
                    nativeTextareaHandler.findTextarea()

                  const tabContainer =
                    nativeTextareaHandler.findTabContainer(jsCommentField)
                  // TODO: add log Cannot inject editor without a tab container. Should never enter here
                  if (!tabContainer) {
                    return
                  }

                  const textExpander =
                    nativeTextareaHandler.findTextExpander(jsCommentField)
                  !!textExpander &&
                    nativeTextareaHandler.loadSuggestionDataAsync(
                      textExpander,
                      {
                        onEmojiChange: (emojis) =>
                          setSuggestionData((data) => ({
                            ...data,
                            emojis,
                          })),
                        onReferenceSuggestionChange: (references) =>
                          setSuggestionData((data) => ({
                            ...data,
                            references,
                          })),
                        onMentionsChange: (mentions) =>
                          setSuggestionData((data) => ({
                            ...data,
                            mentions,
                          })),
                      },
                    )
                  editorInjector.uploadHandler =
                    nativeTextareaHandler.getUploadHandler()
                  editorInjector.mountFooterFn =
                    nativeTextareaHandler.getMountFooterFn(jsCommentField)
                  editorInjector.mountEditorFn =
                    nativeTextareaHandler.getMountEditorFn()
                } else {
                  type = 'react'

                  reactTextareaHandler.loadSuggestionDataAsync(element, {
                    onSuggestionDataChange: (data) => setSuggestionData(data),
                  })

                  editorInjector.uploadHandler =
                    reactTextareaHandler.getUploadHandler()

                  editorInjector.findTextarea = () =>
                    reactTextareaHandler.findTextarea()

                  const textarea = reactTextareaHandler.findTextarea()
                  setTextareaRef(textarea)

                  editorInjector.mountFooterFn =
                    reactTextareaHandler.getMountFooterFn()

                  editorInjector.mountEditorFn =
                    reactTextareaHandler.getMountEditorFn()
                }

                const root = editorInjector.createRootContainer()
                // Since I didn't really find a good way to detect if the current textarea
                // has been disconnected. I'll now check via mutation observer.
                // TODO: potential perforamnce issue
                const observer = new MutationObserver((entry) => {
                  const ref = textareaRef()
                  if (!ref || !ref.isConnected) {
                    // This is needed to trigger a re-execution of the
                    // effect that will check if the textarea is still connected
                    // so we are able to reset the content
                    setTextareaRef(editorInjector.findTextarea?.() ?? null)
                  }
                })
                observer.observe(element, {
                  childList: true,
                  subtree: true,
                  characterData: true,
                  attributes: true,
                })
                onCleanup(() => {
                  observer.disconnect()
                })

                editorInjector.mountFooterFn(root)
                editorInjector.mountEditorFn(root)

                const currentTextarea = editorInjector.findTextarea()
                if (!currentTextarea) {
                  return
                }

                editorElement.setDisposer(
                  mountEditor(root, {
                    currentUsername,
                    suggestionData,
                    open: showOldEditor,
                    openChange: setShowOldEditor,
                    uploadHandler: editorInjector.uploadHandler!,
                    textarea: textareaRef,
                    get initialValue() {
                      return textareaRef()?.value ?? ''
                    },
                    type,
                    repository,
                    owner: repositoryOwner,
                  }),
                )
              })
            },
          })
        })
      },
    })
  })
})
