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

import { effect } from 'solid-js/web'
import {
  fetchMentionableUsers,
  getUserAvatarId,
  tryGetReferences,
} from '../../../src/github/data'
import { GitHubUploaderNativeHandler } from '../../../src/core/editor/image/github-file-uploader'
import type { AttachmentHandlerElement } from '../../../src/core/editor/image/github-file-uploader'
import type { SuggestionData } from '../../../src/editor/utils/loadSuggestionData'

export class GitHubNativeTextareaHandler {
  readonly classes: { [key: string]: Array<string> } = {}
  readonly root: HTMLElement
  readonly instance: GitHubEditorInstance

  get classList() {
    return [...new Set(Object.values(this.classes).flat())]
  }

  tabContainer: HTMLElement | null = null

  constructor(root: HTMLElement, editorInstance: GitHubEditorInstance) {
    this.root = root
    this.instance = editorInstance
  }

  findTextarea() {
    return this.root.querySelector<HTMLTextAreaElement>(
      'textarea.js-comment-field',
    )
  }

  findTextExpander(textarea: HTMLTextAreaElement) {
    return textarea.closest<HTMLElement>('text-expander')
  }

  // New comment at the bottom of the page
  findNewCommentForm(textarea: HTMLTextAreaElement) {
    return textarea.closest<HTMLFormElement>('#new_comment_form')
  }

  // Inline comment for thread reply
  findInlineCommentForm(textarea: HTMLTextAreaElement) {
    return textarea.closest('.js-inline-comment-form')
  }

  findTabContainer(textarea: HTMLTextAreaElement) {
    this.classes['tab-container'] = []
    // Search for closest tab-container of the textarea.
    // This element is the wrapper of the entire comment box.
    let tabContainer = textarea.closest<HTMLElement>('tab-container')
    if (!tabContainer) {
      // When the tab container is not present, the user is probably trying to edit an existing pull request comment
      tabContainer = textarea.closest<HTMLElement>('.CommentBox')
      this.classes['tab-container'].push('m-2')
    }
    this.tabContainer = tabContainer
    return tabContainer
  }

  getUploadHandler() {
    const root = this.root
    const fileAttachmentTransfer =
      root.closest<AttachmentHandlerElement>('file-attachment')
    if (fileAttachmentTransfer) {
      return new GitHubUploaderNativeHandler(fileAttachmentTransfer)
    }
    return null
  }

  getMountFooterFn(textarea: HTMLTextAreaElement): (node: HTMLElement) => void {
    const newCommentForm = this.findNewCommentForm(textarea)
    // If we are in a new comment form, we can directly inject
    // the footer into the bottom action bar
    if (newCommentForm) {
      return () => {
        const commentFooter = newCommentForm.querySelector(
          '#partial-new-comment-form-actions',
        )
        if (commentFooter) {
          const actionsWrapper = commentFooter.firstElementChild
          if (actionsWrapper) {
            const switchRoot = document.createElement('div')
            actionsWrapper.prepend(switchRoot)
            this.instance.switchButton.render(switchRoot)
          }
        }
      }
    }
    // If a new comment form is not present, we should check first if we are
    // in an inline comment form (thread reply)
    const inlineCommentForm = this.findInlineCommentForm(textarea)
    if (inlineCommentForm) {
      return () => {
        const formActions =
          inlineCommentForm.querySelector<HTMLElement>('.form-actions')
        if (formActions) {
          const switchRoot = document.createElement('div')
          switchRoot.style.display = 'inline'
          formActions.prepend(switchRoot)
          // Actions are a bit different here, so we need to pass so custom options
          // to align with the page style
          this.instance.switchButton.render(switchRoot, {
            size: 'medium',
            variant: 'secondary',
          })
        }
      }
    }

    // If both previous cases don't match, as a last resort we can try to get
    // the slash-command surface container closest to the `tabContainer`
    const slashCommandSurface = this.findTabContainer(textarea)?.closest(
      '.js-slash-command-surface',
    )
    if (slashCommandSurface) {
      return () => {
        // A little tricky here, but we have to prepend the switch button to this container
        const el = slashCommandSurface.lastElementChild
        if (el) {
          const switchRoot = document.createElement('div')
          switchRoot.style.display = 'inline'
          el.prepend(switchRoot)
          this.instance.switchButton.render(switchRoot, {
            size: 'medium',
            variant: 'secondary',
          })
        }
      }
    }

    // This case will match in the PR comment edit
    const tabContainer = this.findTabContainer(textarea)
    if (tabContainer && tabContainer.classList.contains('CommentBox')) {
      const nextSibling = tabContainer.nextElementSibling
      // Hope will match
      if (nextSibling && nextSibling.tagName === 'DIV') {
        const switchRoot = document.createElement('div')
        switchRoot.style.display = 'inline'
        nextSibling.prepend(switchRoot)
        this.instance.switchButton.render(switchRoot, {
          size: 'medium',
          variant: 'secondary',
        })
      }
    }

    return () => {
      // Just a noop
      console.warn(
        '[github-better-comments] No mount point found for the switch button',
      )
    }
  }

  loadSuggestionDataAsync(
    textExpander: HTMLElement,
    callbacks: {
      onReferenceSuggestionChange: (data: SuggestionData['references']) => void
      onMentionsChange: (data: SuggestionData['mentions']) => void
    },
  ) {
    const { emojiUrl, issueUrl, mentionUrl } = textExpander.dataset
    if (issueUrl) {
      tryGetReferences(issueUrl).then((data) => {
        callbacks.onReferenceSuggestionChange(data)
      })
    }
    if (mentionUrl) {
      fetchMentionableUsers(mentionUrl).then((mentionableUsers) => {
        callbacks.onMentionsChange(
          mentionableUsers.map((data) => ({
            avatarUrl: getUserAvatarId(data.id),
            identifier: data.login,
            description: data.name,
            participant: data.participant,
          })),
        )
      })
    }
  }

  getMountEditorFn(): (node: HTMLElement) => void {
    return (node) => {
      const tabContainer = this.findTabContainer(this.findTextarea()!)
      if (tabContainer) {
        effect(() => {
          const show = this.instance.showOldEditor()
          show
            ? tabContainer.style.setProperty('display', 'none')
            : tabContainer.style.removeProperty('display')
        })
        node.classList.add(...this.classList)
        node.style.width = 'auto'
        tabContainer.insertAdjacentElement('beforebegin', node)
      }
    }
  }
}
