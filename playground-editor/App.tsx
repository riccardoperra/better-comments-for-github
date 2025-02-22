import { Show, createSignal } from 'solid-js'
import { Editor } from '../src/editor/editor'
import { TextArea } from './components/TextArea'

const initialValue = `
> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.
`

export function App() {
  const [textareaRef, setTextareaRef] = createSignal<HTMLTextAreaElement>()

  return (
    <div class={'App'}>
      <TextArea ref={setTextareaRef} initialValue={initialValue} />

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
