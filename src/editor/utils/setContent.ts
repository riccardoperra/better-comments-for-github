import { markdownToProseMirror } from './markdownParser'
import type { EditorView } from 'prosemirror-view'

export function setEditorContent(
  content: string,
  view: EditorView,
  options?: Partial<{
    isInitialValue: boolean
    isFromTextarea: boolean
  }>,
) {
  const { isInitialValue = false, isFromTextarea = false } = options ?? {}
  const schema = view.state.schema
  return markdownToProseMirror(content, schema).then((vfile) => {
    const result = vfile.result
    const tr = view.state.tr

    tr.replaceWith(0, tr.doc.content.size, result)
    if (isInitialValue) {
      tr.setMeta('initial-value', true)
    }
    if (isFromTextarea) {
      tr.setMeta('from-textarea', true)
    }
    view.dispatch(tr)
  })
}
