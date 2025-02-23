import { Show, createSignal } from 'solid-js'
import { Editor, EditorRootContext } from '../src/editor/editor'
import { TextArea } from './components/TextArea'
import { MockUploaderNativeHandler } from './mock-uploader'

const initialValue = `

<img src="https://placehold.co/600x400" alt="Placeholder text">

# heading 1
## heading 2
### heading 3
#### heading 4
##### heading 5
###### heading 6

---

- [ ] Task list item
- [x] Completed task list item

1. Ordered list item
    1. Nested ordered list item
    
- Bullet list item
- Bullet list item 2
  - Bullet list item nested

---

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

  let uploaderRef!: HTMLDivElement

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
    mentions: [],
  }

  return (
    <div class={'App'}>
      <input
        type={'file'}
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) {
            const uploadFile = mockUploader.init(file)
            mockUploader.upload(uploadFile, null)
          }
        }}
      />
      <div>
        <TextArea ref={setTextareaRef} initialValue={initialValue} />

        <Show when={textareaRef()}>
          {(textareaRef) => (
            <div class={'EditorContent'}>
              <EditorRootContext.Provider
                value={{
                  data,
                  uploadHandler: mockUploader,
                  get fileAttachmentTransfer() {
                    return {} as any
                  },
                  get initialValue() {
                    return textareaRef().value
                  },
                  get textarea() {
                    return textareaRef()
                  },
                  get type() {
                    return 'native'
                  },
                }}
              >
                <Editor
                  type={'native'}
                  suggestions={data}
                  textarea={textareaRef()}
                  initialValue={textareaRef().value}
                />
              </EditorRootContext.Provider>
            </div>
          )}
        </Show>
      </div>
    </div>
  )
}
