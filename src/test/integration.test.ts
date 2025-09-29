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

import * as path from 'node:path'
import { createTestEditor } from 'prosekit/core/test'

import { expect, test } from 'vitest'
import { createRoot, getOwner, runWithOwner, useContext } from 'solid-js'
import { convertUnistToProsemirror } from 'prosemirror-transformer-markdown/prosemirror'
import { defineExtension } from '../core/editor/extension'
import { EditorRootContext } from '../editor/editor'
import { MockUploaderNativeHandler } from '../../extension/stories/mock-uploader'
import { unistNodeFromMarkdown } from '../editor/utils/unistNodeFromMarkdown'
import fullExample from './fixtures/full.md?raw'
import type { EditorRootContextProps } from '../editor/editor'
import type { SuggestionData } from '../editor/utils/loadSuggestionData'

const dirname = import.meta.dirname
const snapshotDir = `${dirname}/__snapshots__`

test('Parse markdown', async () => {
  const content = parseMd(fullExample)

  runInTestRoot(content, async () => {
    const extension = defineExtension()
    const editor = createTestEditor({
      extension,
    })
    const context = useContext(EditorRootContext)!

    const unistNode = unistNodeFromMarkdown(content, {
      owner: context.owner,
      repository: context.repository,
    })
    const pmNode = convertUnistToProsemirror(unistNode, editor.schema)
    editor.setContent(pmNode)

    const json = JSON.stringify(editor.getDocJSON())

    await expect(json).toMatchFileSnapshot(
      path.join(snapshotDir, 'full.snapshot.json'),
    )
  })
})

function parseMd(content: string) {
  let sanitizedContent = ''
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i]
    if (ln.startsWith('[//]')) {
      if (lines[i + 1].trim() === '') {
        // skipping next line if empty
        i++
      }
    } else {
      sanitizedContent += ln + '\n'
    }
  }
  return sanitizedContent
}

export function runInTestRoot(content: string, fn: () => any) {
  return createRoot(() => {
    const owner = getOwner()!
    const mockUploader = new MockUploaderNativeHandler()
    const data = {
      references: [
        {
          id: '1',
          titleText: 'This is an example issues',
          iconHtml: '',
          titleHtml: 'This is an example issues',
        },
      ],
      savedReplies: [],
      emojis: [],
      mentions: [
        {
          identifier: 'riccardoperra',
          participant: true,
          description: 'Riccardo Perra',
          avatarUrl: '',
        },
      ],
    } satisfies SuggestionData

    owner.context = {
      ...owner.context,
      [EditorRootContext.id]: {
        suggestionData: data,
        currentUsername: () => 'riccardoperra',
        owner: 'riccardoperra',
        repository: 'test-repository',
        uploadHandler: mockUploader,
        get initialValue() {
          return content
        },
        get textarea() {
          return null as any
        },
        get type() {
          return 'native' as const
        },
      } satisfies EditorRootContextProps,
    }

    return runWithOwner(owner, fn)
  })
}
