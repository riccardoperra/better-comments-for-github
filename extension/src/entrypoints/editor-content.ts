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

import { createComponent, getOwner, runWithOwner } from 'solid-js'
import { effect } from 'solid-js/web'
import { queryComment } from '../../../src/dom/queryComment'
import { createSuggestionData } from '../../../src/editor/utils/loadSuggestionData'
import { GitHubUploaderNativeHandler } from '../../../src/core/editor/image/github-file-uploader'
import {
  fetchMentionableUsers,
  getUserAvatarId,
  tryGetReferences,
} from '../../../src/github/data'
import { createGitHubUploaderReactHandler } from '../../../src/editor/utils/reactFileUploader'
import { SwitchButton, mountEditor } from '../../../src/render'
import styles from './main.module.css'
import type { Accessor, ComponentProps } from 'solid-js'
import type {
  AttachmentHandlerElement,
  GitHubUploaderHandler,
} from '../../../src/core/editor/image/github-file-uploader'
import type { SuggestionData } from '../../../src/editor/utils/loadSuggestionData'
import type { EditorType } from '../../../src/editor/editor'

import './styles.css'

export default defineUnlistedScript(() => {
  createRoot(() => {
    const owner = getOwner()
    queryComment(async (element) => {
      return runWithOwner(owner, async () => {
        const [showOldEditor, setShowOldEditor] = createSignal(true)

        function renderSwitch(
          root: HTMLElement,
          props?: Partial<ComponentProps<typeof SwitchButton>>,
        ) {
          render(
            () =>
              createComponent(SwitchButton, {
                get open() {
                  return showOldEditor()
                },
                onOpenChange: (open) => {
                  setShowOldEditor(open)
                },
                size: props?.size ?? 'small',
                variant: props?.variant ?? 'invisible',
              }),
            root,
          )
        }

        const jsCommentField = element.querySelector<HTMLTextAreaElement>(
          'textarea.js-comment-field',
        )
        let textarea: HTMLTextAreaElement | null = null
        let mountElFunction: (node: HTMLElement) => void
        let suggestionData: Accessor<SuggestionData>
        let type: EditorType
        let uploadHandler: GitHubUploaderHandler

        // Old comment component of GitHub, This is still present in pull requests
        if (jsCommentField) {
          type = 'native'
          textarea = jsCommentField

          const textExpander =
            jsCommentField.closest<HTMLElement>('text-expander')
          if (textExpander) {
            const { emojiUrl, issueUrl, mentionUrl } = textExpander.dataset

            const [issues, mentionableUsers] = await Promise.all([
              await tryGetReferences(issueUrl!),
              await fetchMentionableUsers(mentionUrl!),
            ])

            suggestionData = () => ({
              mentions: mentionableUsers.map((data) => ({
                avatarUrl: getUserAvatarId(data.id),
                identifier: data.login,
                description: data.name,
                participant: data.participant,
              })),
              emojis: [],
              references: issues,
              savedReplies: [],
            })
          }

          const fileAttachmentTransfer =
            jsCommentField.closest<AttachmentHandlerElement>('file-attachment')
          if (fileAttachmentTransfer) {
            uploadHandler = new GitHubUploaderNativeHandler(
              fileAttachmentTransfer,
            )
          }

          const classes = [] as Array<string>
          // Search for closest tab-container of the textarea.
          // This element is the wrapper of the entire comment box.
          let tabContainer =
            jsCommentField.closest<HTMLElement>('tab-container')
          if (!tabContainer) {
            // When tab container is not present, user is trying to edit an existing pull request comment
            tabContainer = jsCommentField.closest<HTMLElement>('.CommentBox')
            classes.push('m-2')
          }

          if (!tabContainer) {
            // TODO: add log
            return
          }

          const newCommentForm =
            jsCommentField.closest<HTMLFormElement>('#new_comment_form')

          let mountFooter: () => void

          // new comment at the bottom of the page
          if (newCommentForm) {
            mountFooter = () => {
              const commentFooter = newCommentForm.querySelector(
                '#partial-new-comment-form-actions',
              )
              if (commentFooter) {
                const actionsWrapper = commentFooter.firstElementChild
                if (actionsWrapper) {
                  const switchRoot = document.createElement('div')
                  actionsWrapper.prepend(switchRoot)
                  renderSwitch(switchRoot)
                }
              }
            }
          } else {
            // inline comment form is for thread reply
            const inlineCommentForm = jsCommentField.closest(
              '.js-inline-comment-form',
            )
            if (inlineCommentForm) {
              mountFooter = () => {
                const formActions =
                  inlineCommentForm.querySelector<HTMLElement>('.form-actions')
                if (formActions) {
                  const switchRoot = document.createElement('div')
                  switchRoot.style.display = 'inline'
                  formActions.prepend(switchRoot)
                  renderSwitch(switchRoot, {
                    size: 'medium',
                    variant: 'secondary',
                  })
                }
              }
            } else {
              console.log(element)
            }
          }

          // We should create our element before the tab container
          mountElFunction = (node) => {
            mountFooter()

            effect(() => {
              const show = showOldEditor()
              show
                ? tabContainer.style.setProperty('display', 'none')
                : tabContainer.style.removeProperty('display')
            })

            node.classList.add(...classes)
            node.style.width = 'auto'
            tabContainer.insertAdjacentElement('beforebegin', node)
          }
        } else {
          type = 'react'
          const suggestionDataResult = createSuggestionData(element)
          uploadHandler = createGitHubUploaderReactHandler(element)
          suggestionData = suggestionDataResult.suggestionData
          const moduleContainer = element.querySelector(
            '[class*="MarkdownEditor-module__container"]',
          )!
          textarea =
            moduleContainer.querySelector<HTMLTextAreaElement>('textarea')

          const footerModule = element.querySelector(
            'footer[class*="Footer-module"]',
          )

          mountElFunction = (node) => {
            if (footerModule) {
              const actionsWrapper = footerModule.firstElementChild
              if (actionsWrapper) {
                const switchRoot = document.createElement('div')
                actionsWrapper.prepend(switchRoot)
                renderSwitch(switchRoot)

                effect(() => {
                  const show = showOldEditor()
                  const wrapper = element.querySelector<HTMLElement>(
                    '[class*="MarkdownEditor-module__inputWrapper"]',
                  )
                  if (wrapper) {
                    show
                      ? wrapper.style.setProperty('display', 'none')
                      : wrapper.style.removeProperty('display')
                  }
                })
              }
            }

            moduleContainer.prepend(node)
          }
        }

        if (!textarea) {
          // add log
          return
        }

        const root = document.createElement('div')
        root.id = 'github-better-comment'
        root.className = styles.injectedEditorContent

        runWithOwner(owner, () => {
          mountElFunction(root)
          mountEditor(root, {
            get open() {
              return showOldEditor()
            },
            get suggestionData() {
              return suggestionData()
            },
            get uploadHandler() {
              return uploadHandler
            },
            get textarea() {
              return textarea
            },
            get initialValue() {
              return textarea.value
            },
            type,
          })
        })
      })
    })
  })
})
