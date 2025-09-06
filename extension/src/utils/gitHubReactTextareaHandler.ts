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
import { createSuggestionData } from '@better-comments-for-github/core/editor/utils/loadSuggestionData'
import { createGitHubUploaderReactHandler } from '@better-comments-for-github/core/editor/utils/reactFileUploader'
import type { SuggestionData } from '@better-comments-for-github/core/editor/utils/loadSuggestionData'

export class GitHubReactTextareaHandler {
  readonly classes: { [key: string]: Array<string> } = {}
  readonly root: HTMLElement
  readonly instance: GitHubEditorInstance

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
    if (this.root.matches('[class*="MarkdownEditor-module__container"]')) {
      return this.root
    }

    return this.root.querySelector(
      '[class*="MarkdownEditor-module__container"]',
    )
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
    const footerModule = this.root.querySelector('[class*="Footer-module"]')
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
