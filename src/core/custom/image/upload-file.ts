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

import { insertNode, union } from 'prosekit/core'
import {
  defineFileDropHandler,
  defineFilePasteHandler,
} from 'prosekit/extensions/file'
import { useContext } from 'solid-js'
import { EditorRootContext } from '../../../editor/editor'

export function defineImageFileHandlers() {
  const context = useContext(EditorRootContext)!
  const uploadHandler = context.uploadHandler
  return union(
    defineFilePasteHandler(({ view, file, event }) => {
      if (!file.type.startsWith('image/')) {
        return false
      }
      const gitHubFile = uploadHandler.init(file)
      uploadHandler.upload(gitHubFile, event.clipboardData)
      const command = insertNode({
        type: 'image',
        attrs: { src: gitHubFile.objectURL, referenceId: gitHubFile.id },
      })
      return command(view.state, view.dispatch, view)
    }),
    defineFileDropHandler(({ view, file, pos, event }) => {
      if (!file.type.startsWith('image/')) {
        return false
      }
      const gitHubFile = uploadHandler.init(file)
      uploadHandler.upload(gitHubFile, event.dataTransfer)
      const command = insertNode({
        type: 'image',
        attrs: { src: gitHubFile.objectURL, referenceId: gitHubFile.id },
        pos,
      })
      return command(view.state, view.dispatch, view)
    }),
  )
}
