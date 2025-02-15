import { render } from 'solid-js/web'
import { waitForCommentArea } from './dom/waitForCommentArea'
import { Editor } from './editor/editor'

import styles from './content.module.css'
import './styles.css'

waitForCommentArea().then((textarea) => {
  const parent = textarea.parentElement!.parentElement
  if (parent) {
    const root = document.createElement('div')
    root.id = 'github-better-comment'
    root.className = styles.injectedEditorContent
    parent.appendChild(root)

    render(
      () => <Editor textarea={textarea} initialValue={textarea.value} />,
      root,
    )
  }
})
