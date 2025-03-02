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
import type {
  AttachmentHandlerElement,
  GitHubUploaderHandler,
} from '../../../src/core/editor/image/github-file-uploader'
import type { SuggestionData } from '../../../src/editor/utils/loadSuggestionData'
import type { Accessor, ComponentProps } from 'solid-js'
import type { EditorType } from '../../../src/editor/editor'

import './styles.css'
import { isAssertionError, suite } from '@/utils/domInjectorAssert'

export default defineUnlistedScript(() => {
  let id = 0
  createRoot(() => {
    const owner = getOwner()

    queryComment(async (element) => {
      const { repository, repositoryOwner } = parseGitHubUrl(
        window.location.pathname,
      )

      const currentId = id++

      const t = suite(`Editor ${currentId}`)

      await runWithOwner(owner, async () => {
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

        let textarea: HTMLTextAreaElement | null = null
        let findTextarea: () => HTMLTextAreaElement
        let mountElFunction: (node: HTMLElement) => void
        let suggestionData: Accessor<SuggestionData>
        let type: EditorType
        let uploadHandler: GitHubUploaderHandler

        const isNativeTextarea = await t(
          'Check is using native textarea instead of React component',
          async (t) => {
            const jsCommentField = element.querySelector<HTMLTextAreaElement>(
              'textarea.js-comment-field',
            )

            if (!jsCommentField) {
              return new DomAssertionError('No native textarea found')
            }

            type = 'native'
            textarea = jsCommentField
            findTextarea = () =>
              element.querySelector<HTMLTextAreaElement>(
                'textarea.js-comment-field',
              )!

            await t('Check for text-expander element', async () => {
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
            })

            const fileAttachmentTransfer = await t(
              'Check for file attachment element',
              async () =>
                jsCommentField.closest<AttachmentHandlerElement>(
                  'file-attachment',
                ) ?? new DomAssertionError('No file attachment element found'),
            )
            if (!isAssertionError(fileAttachmentTransfer)) {
              uploadHandler = new GitHubUploaderNativeHandler(
                fileAttachmentTransfer,
              )

              const x = 0
            }

            const classes = [] as Array<string>

            const tabContainer = await t(
              'Search for closest tab-container of the textarea',
              async (t) => {
                // Search for closest tab-container of the textarea.
                // This element is the wrapper of the entire comment box.
                let tabContainer = await t(
                  'Search for closest tab-container',
                  async () => {
                    return (
                      jsCommentField.closest<HTMLElement>('tab-container') ??
                      new DomAssertionError('No tab-container found')
                    )
                  },
                )
                if (isAssertionError(tabContainer)) {
                  tabContainer = await t(
                    'Search for closest CommentBox',
                    async () => {
                      return (
                        jsCommentField.closest<HTMLElement>('.CommentBox') ??
                        new DomAssertionError('No .CommentBox found')
                      )
                    },
                  )
                  if (tabContainer) {
                    classes.push('m-2')
                  }
                }
                return tabContainer
              },
            )

            if (isAssertionError(tabContainer)) {
              return
            }

            const slashCommandSurface = await t(
              'Get slash command surface',
              () => {
                return (
                  tabContainer.closest('.js-slash-command-surface') ??
                  new DomAssertionError('No slash command surface')
                )
              },
            )

            let mountFooter: undefined | (() => void)

            const mountFooterResult = await t(
              'Retrieve footer element to mount switch button',
              async (t) => {
                let result = await t(
                  'Get footer from #new_comment_form',
                  async (t) => {
                    const newCommentForm = await t(
                      'Get #new_comment_form',
                      () =>
                        jsCommentField.closest<HTMLFormElement>(
                          '#new_comment_form',
                        ) ?? new DomAssertionError('No #new_comment_form'),
                    )

                    if (isAssertionError(newCommentForm)) return newCommentForm

                    const newCommentFormActions = await t(
                      'Get #partial-new-comment-form-actions',
                      () => {
                        return (
                          newCommentForm.querySelector(
                            '#partial-new-comment-form-actions',
                          ) ?? new DomAssertionError('')
                        )
                      },
                    )

                    if (isAssertionError(newCommentFormActions))
                      return newCommentFormActions

                    return () => {
                      const actionsWrapper =
                        newCommentFormActions.firstElementChild
                      if (actionsWrapper) {
                        const switchRoot = document.createElement('div')
                        actionsWrapper.prepend(switchRoot)
                        renderSwitch(switchRoot)
                      }
                    }
                  },
                )
                if (!isAssertionError(result)) {
                  return result
                }

                result = await t(
                  'Get footer from .js-inline-comment-form',
                  () => {
                    const commentForm = jsCommentField.closest(
                      '.js-inline-comment-form',
                    )
                    if (!commentForm)
                      return new DomAssertionError('No comment form')

                    return () => {
                      const formActions =
                        commentForm.querySelector<HTMLElement>('.form-actions')
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
                  },
                )

                if (!isAssertionError(result)) {
                  return result
                }

                if (!isAssertionError(slashCommandSurface)) {
                  const el = slashCommandSurface.lastElementChild
                  return () => {
                    if (el) {
                      const switchRoot = document.createElement('div')
                      switchRoot.style.display = 'inline'
                      el.prepend(switchRoot)
                      renderSwitch(switchRoot, {
                        size: 'medium',
                        variant: 'secondary',
                      })
                    }
                  }
                }

                return result
              },
            )

            if (!isAssertionError(mountFooterResult)) {
              mountFooter = mountFooterResult
            }

            // We should create our element before the tab container
            mountElFunction = (node) => {
              mountFooter?.()

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
          },
        )

        // Old comment component of GitHub, This is still present in pull requests
        if (isAssertionError(isNativeTextarea)) {
          type = 'react'
          const suggestionDataResult = createSuggestionData(element)
          uploadHandler = createGitHubUploaderReactHandler(element)
          suggestionData = suggestionDataResult.suggestionData

          const moduleContainer = await t(
            'Check has markdown module container',
            () => {
              const moduleContainer = element.querySelector<HTMLElement>(
                '[class*="MarkdownEditor-module__container"]',
              )
              if (!moduleContainer) throw new DomAssertionError('')
              return moduleContainer
            },
          )

          if (!isAssertionError(moduleContainer)) {
            const _textarea = await t(
              'Check for textarea',
              () =>
                moduleContainer.querySelector<HTMLTextAreaElement>(
                  'textarea',
                ) ?? new DomAssertionError(''),
            )

            findTextarea = () =>
              moduleContainer.querySelector<HTMLTextAreaElement>('textarea')!

            if (!isAssertionError(_textarea)) textarea = _textarea

            const footerModule = await t('Check for footer module', () => {
              return (
                element.querySelector('footer[class*="Footer-module"]') ??
                new DomAssertionError('')
              )
            })
            if (!isAssertionError(footerModule)) {
              mountElFunction = (node) => {
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
                moduleContainer.prepend(node)
              }
            }
          }
        }

        if (!textarea) {
          // add log
          return
        }

        const root = document.createElement('div')
        root.id = 'github-better-comment'
        root.className = styles.injectedEditorContent

        console.log('set root')

        runWithOwner(owner, () => {
          const [textareaRef, setTextareaRef] = createSignal(textarea)
          // Since I didn't really find a good way to detect if the current textarea
          // has been disconnected. I'll now check via mutation observer.
          // TODO: potential perforamnce issue
          const observer = new MutationObserver((mutation) => {
            const ref = textareaRef()
            if (!ref?.isConnected) setTextareaRef(findTextarea())
          })
          observer.observe(element, {
            childList: true,
            subtree: true,
            characterData: true,
          })
          onCleanup(() => observer.disconnect())

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
            textarea: textareaRef,
            get initialValue() {
              return textarea.value
            },
            type,
            repository,
            owner: repositoryOwner,
          })
        })
      })

      t.collect()
    })
  })
})
