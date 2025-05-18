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

import styles from '../entrypoints/main.module.css'
import type { GitHubUploaderHandler } from '../../../src/editor/utils/uploaderHandler'

export class GitHubEditorInjector {
  uploadHandler: null | GitHubUploaderHandler = null
  findTextarea: null | (() => HTMLTextAreaElement | null) = null
  mountFooterFn: null | ((node: HTMLElement) => void) = null
  mountEditorFn: null | ((node: HTMLElement) => void) = null

  constructor() {}

  createRootContainer(): HTMLDivElement {
    const root = document.createElement('div')
    root.id = 'github-better-comment'
    root.className = styles.injectedEditorContent
    return root
  }

  destroy(): void {
    this.mountFooterFn = null
    this.mountEditorFn = null
    this.findTextarea = null
    this.uploadHandler = null
  }
}
