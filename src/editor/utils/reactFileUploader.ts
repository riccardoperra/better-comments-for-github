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
import { createMemo, createSignal } from 'solid-js'
import {
  getFiber,
  traverseFiber,
  waitForReactFiber,
} from '../../core/react-hacks/fiber'
import { loadImagePreview } from './uploaderHandler'
import type { Fiber } from '../../core/react-hacks/fiber'
import type {
  GitHubFile,
  GitHubUploaderHandler,
} from '../../core/editor/image/github-file-uploader'

export class GitHubUploaderReactHandler implements GitHubUploaderHandler {
  #store = createStore<Array<GitHubFile>>([])
  readonly get = this.#store[0]
  readonly set = this.#store[1]

  constructor(readonly getFiber: () => Fiber) {}

  init = (originalFile: File): GitHubFile => {
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

  upload = (file: GitHubFile, dataTransfer: DataTransfer | null) => {
    const fiber = this.getFiber()
    const getIndex = () => this.get.findIndex((_) => _.id === file.id)

    this.set(getIndex(), (file) => ({
      ...file,
      status: 'progress',
    }))

    fiber.memoizedProps
      .onUploadFile(file.file)
      .then((result: { file: File; url: string }) => {
        this.set(getIndex(), (file) => ({
          ...file,
          originalUrl: result.url,
          status: 'progress',
        }))
        loadImagePreview(result.url).then((previewUrl) => {
          this.set(getIndex(), (file) => ({
            ...file,
            previewUrl,
            status: 'done',
          }))
        })
      })
      .catch((error: Error) => {
        this.set(getIndex(), (file) => ({
          ...file,
          status: 'error',
          errorMessage: error.message,
        }))
      })
  }
}

export function createGitHubUploaderReactHandler(element: HTMLElement) {
  const fiber = getFiber(element)

  const [reactiveFiber, setFiber] = createSignal()

  if (!fiber) {
    waitForReactFiber(element).then((fiber) => {
      setFiber(fiber)
    })
  } else {
    setFiber(fiber)
  }

  return new GitHubUploaderReactHandler(
    createMemo(() => getEditorFiber(reactiveFiber())),
  )
}

function getEditorFiber(fiber: Fiber) {
  const result = traverseFiber(fiber, false, (sel) => {
    return !!sel.memoizedProps.onUploadFile
  })

  if (!result) {
    return null
  }
  return result
}
