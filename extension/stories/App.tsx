import { Show, createSignal } from 'solid-js'
import { StateProvider } from 'statebuilder'
import { Editor, EditorRootContext } from '../../src/editor/editor'
import { MockUploaderNativeHandler } from './mock-uploader'

import type { Ref } from 'solid-js'
import type { SuggestionData } from '../../src/editor/utils/loadSuggestionData'

export interface AppProps {
  initialValue: string
}

export function App(props: AppProps) {
  const [textareaRef, setTextareaRef] = createSignal<HTMLTextAreaElement>()

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

  return (
    <StateProvider>
      <div class={'App'}>
        <TextArea ref={setTextareaRef} initialValue={props.initialValue} />

        <Show when={textareaRef()}>
          {(textareaRef) => (
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
                    return textareaRef().value
                  },
                  textarea: textareaRef,
                  get type() {
                    return 'native' as const
                  },
                }}
              >
                <Editor type={'native'} suggestions={data} />
              </EditorRootContext.Provider>
            </div>
          )}
        </Show>
      </div>
    </StateProvider>
  )
}

interface TextAreaProps {
  ref: Ref<HTMLTextAreaElement>
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
