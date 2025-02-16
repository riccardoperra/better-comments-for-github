import { Show, createSignal } from 'solid-js'
import { Editor } from '../src/editor/editor'
import { TextArea } from './components/TextArea'

export function App() {
  const [textareaRef, setTextareaRef] = createSignal<HTMLTextAreaElement>()

  return (
    <div class={'App'}>
      <TextArea ref={setTextareaRef} />

      <Show when={textareaRef()}>
        {(textareaRef) => (
          <div class={'EditorContent'}>
            <Editor
              suggestions={{
                references: [],
                savedReplies: [],
                emojis: [],
                mentions: [],
              }}
              textarea={textareaRef()}
              initialValue={textareaRef().value}
            />
          </div>
        )}
      </Show>
    </div>
  )
}
