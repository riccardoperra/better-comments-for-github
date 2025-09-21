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

import './styles.scss'
import { StateProvider } from 'statebuilder'
import { ConfigStore } from '../../../../src/config.store'
import {
  Editor as EditorCore,
  EditorRootContext,
} from '../../../../src/editor/editor'
import { MockUploaderNativeHandler } from '../../../../extension/stories/mock-uploader'
import type { SuggestionData } from '@better-comments-for-github/core/editor/utils/loadSuggestionData'

function App() {
  const mockUploader = new MockUploaderNativeHandler()
  const data = {
    references: [],
    savedReplies: [],
    emojis: [],
    mentions: [],
  } satisfies SuggestionData

  function Content() {
    const configStore = ConfigStore.provide()
    configStore.set('showDebug', 'md')
    return <EditorCore type={'native'} suggestions={data} />
  }

  return (
    <StateProvider>
      <div>
        <div class={'EditorContent'}>
          <EditorRootContext.Provider
            value={{
              data: () => data,
              currentUsername: () => 'riccardoperra',
              owner: () => 'riccardoperra',
              repository: () => 'test-repository',
              hovercardSubjectTag: () => '1',
              uploadHandler: mockUploader,
              get initialValue() {
                return ''
              },
              id: 'cl-1',
              textarea: () => document.createElement('textarea'),
              get type() {
                return 'native' as const
              },
            }}
          >
            <Content />
          </EditorRootContext.Provider>
        </div>
      </div>
    </StateProvider>
  )
}

interface TextAreaProps {
  initialValue?: string
}

function TextArea(props: TextAreaProps) {
  return (
    <textarea
      ref={props.ref}
      class={'FormControl FormControl-textarea'}
      value={props.initialValue}
    ></textarea>
  )
}

export function Editor() {
  return <App />
}
