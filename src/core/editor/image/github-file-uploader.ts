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

import { createStore } from 'solid-js/store'
import { getImagePreviewUrl } from '../../../github/data'

export type GitHubFile = {
  id: string
  file: File | null
  objectURL: string | null
  previewUrl: string | null
  originalUrl: string | null
  status: 'idle' | 'error' | 'progress' | 'done'
  errorMessage?: string
}

export interface GitHubUploaderStoreOptions {
  behavior: 'native' | 'react'
}

export type AttachmentHandlerElement = HTMLElement & {
  attach: (dataTransfer: DataTransfer | null) => void
}

export interface GitHubUploaderHandler {
  init: (originalFile: File) => GitHubFile

  upload: (file: GitHubFile, dataTransfer: DataTransfer | null) => void

  get: ReadonlyArray<GitHubFile>
}

const possibleErrorStates = [
  'is-default',
  'is-uploading',
  'is-bad-file',
  'is-duplicate-filename',
  'is-too-big',
  'is-too-many',
  'is-hidden-file',
  'is-failed',
  'is-bad-dimensions',
  'is-empty',
  'is-bad-permissions',
  'is-repository-required',
  'is-bad-format',
]

export class GitHubUploaderNativeHandler implements GitHubUploaderHandler {
  #store = createStore<Array<GitHubFile>>([])
  #attachmentHandler: AttachmentHandlerElement
  readonly get = this.#store[0]
  readonly set = this.#store[1]

  constructor(attachmentHandler: AttachmentHandlerElement) {
    this.#attachmentHandler = attachmentHandler
  }

  init(originalFile: File): GitHubFile {
    const objectURL = URL.createObjectURL(originalFile)

    const file: GitHubFile = {
      id: crypto.randomUUID(),
      file: originalFile,
      previewUrl: null,
      originalUrl: null,
      objectURL,
      status: 'idle',
    }

    this.set(this.get.length, file)

    return file
  }

  upload(file: GitHubFile, dataTransfer: DataTransfer | null): void {
    const getIndex = () => this.get.findIndex((_) => _.id === file.id)

    this.#attachmentHandler.addEventListener(
      'upload:invalid',
      async (error) => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            let errorState: string | null = null
            for (const possibleErrorState of possibleErrorStates) {
              if (
                this.#attachmentHandler.classList.contains(possibleErrorState)
              ) {
                errorState = possibleErrorState
                break
              }
            }

            let errorMessage = 'Unknown error'
            if (errorState) {
              const errorsContainer = this.#attachmentHandler.querySelector(
                '.file-attachment-errors',
              )
              if (errorsContainer) {
                const banners = errorsContainer.querySelectorAll('x-banner')
                for (const banner of banners.values()) {
                  const error = banner.querySelector<HTMLElement>(
                    '[data-view-component]',
                  )
                  if (
                    error &&
                    error.classList.contains(errorState.replace('is-', ''))
                  ) {
                    errorMessage = error.innerText
                  }
                }
              }
            }

            this.set(getIndex(), (file) => ({
              ...file,
              status: 'error',
              errorMessage,
            }))
          })
        })
      },
    )

    this.#attachmentHandler.addEventListener(
      'upload:complete',
      async (event) => {
        const href = (event as CustomEvent<{ attachment: { href: string } }>)
          .detail.attachment.href

        this.set(getIndex(), (file) => ({
          ...file,
          originalUrl: href,
          status: 'progress',
        }))

        this.loadPreview(href).then((previewUrl) => {
          this.set(getIndex(), (file) => ({
            ...file,
            previewUrl,
            status: 'done',
          }))
        })
      },
    )

    this.set(getIndex(), (file) => ({
      ...file,
      status: 'progress',
    }))

    this.#attachmentHandler.attach(dataTransfer)
  }

  private async loadPreview(href: string): Promise<string> {
    const repositoryId = document.querySelector<HTMLMetaElement>(
      'meta[name="octolytics-dimension-repository_id"]',
    )?.content
    const projectId = document
      .querySelector<HTMLMetaElement>('meta[name="hovercard-subject-tag"]')
      ?.content.replace('issue:', '')
    const htmlText = await getImagePreviewUrl(href, projectId!, repositoryId!)
    const getUrlFromHtml = (html: string) => {
      const regex = /https:\/\/[^"'\s]+/i
      const match = html.match(regex)
      return match ? match[0] : null
    }

    return getUrlFromHtml(htmlText)!
  }
}
