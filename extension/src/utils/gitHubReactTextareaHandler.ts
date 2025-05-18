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
import { createSuggestionData } from '../../../src/editor/utils/loadSuggestionData'
import { createGitHubUploaderReactHandler } from '../../../src/editor/utils/reactFileUploader'
import type { SuggestionData } from '../../../src/editor/utils/loadSuggestionData'

export class GitHubReactTextareaHandler {
  readonly classes: { [key: string]: Array<string> } = {}
  readonly root: HTMLElement
  readonly instance: GitHubEditorInstance

  tabContainer: HTMLElement | null = null

  constructor(root: HTMLElement, editorInstance: GitHubEditorInstance) {
    this.root = root
    this.instance = editorInstance
  }

  findTextarea() {
    const moduleContainer = this.findModuleContainer()
    if (!moduleContainer) return null
    return moduleContainer.querySelector<HTMLTextAreaElement>('textarea')
  }

  findModuleContainer() {
    return this.root.querySelector(
      '[class*="MarkdownEditor-module__container"]',
    )
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
    return createGitHubUploaderReactHandler(this.root)
  }

  getMountEditorFn(): (node: HTMLElement) => void {
    return (node) => {
      effect(() => {
        const show = this.instance.showOldEditor()
        const wrapper = this.root.querySelector<HTMLElement>(
          '[class*="MarkdownEditor-module__inputWrapper"]',
        )
        if (wrapper) {
          show
            ? wrapper.style.setProperty('display', 'none')
            : wrapper.style.removeProperty('display')
        }
      })

      this.findModuleContainer()?.prepend(node)
    }
  }

  getMountFooterFn(): (node: HTMLElement) => void {
    const footerModule = this.root.querySelector(
      'footer[class*="Footer-module"]',
    )
    if (footerModule) {
      return () => {
        const actionsWrapper = footerModule.firstElementChild
        if (actionsWrapper) {
          const switchRoot = document.createElement('div')
          actionsWrapper.prepend(switchRoot)
          this.instance.switchButton.render(switchRoot)
        }
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
    element: HTMLElement,
    callbacks: {
      onSuggestionDataChange: (data: SuggestionData) => void
    },
  ) {
    const suggestionDataResult = createSuggestionData(element)
    createEffect(() => {
      callbacks.onSuggestionDataChange(suggestionDataResult.suggestionData())
    })
  }
}
