import { render } from 'solid-js/web'
import { waitForCommentArea } from './dom/waitForCommentArea'

export function App() {
  return <div>My app</div>
}

waitForCommentArea().then((textarea) => {
  console.log('my text area', textarea)
})

const root = document.createElement('div')
root.id = 'crx-root'
document.body.append(root)

render(() => <App />, root)
