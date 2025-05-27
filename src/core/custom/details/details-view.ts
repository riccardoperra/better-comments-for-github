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

import { defineNodeView, union } from 'prosekit/core'
import styles from './details-view.module.css'

export function defineDetailsView() {
  return union(defineDetailsHostView(), defineDetailsSummaryView())
}

function defineDetailsSummaryView() {
  return defineNodeView({
    name: 'detailsSummary',
    constructor(node, view, getPos) {
      const summary = document.createElement('summary')
      const marker = document.createElement('button')
      marker.classList.add(styles.marker)
      marker.contentEditable = 'false'
      const content = document.createElement('div')
      summary.appendChild(marker)
      summary.appendChild(content)

      marker.addEventListener('mousedown', (event) => {
        event.preventDefault()
      })

      summary.addEventListener('click', (event) => {
        if (!event.composedPath().includes(marker)) {
          event.preventDefault()
          event.stopPropagation()
        }
      })

      marker.addEventListener('click', (event) => {
        summary.parentElement?.dispatchEvent(new CustomEvent('click-summary'))
        event.preventDefault()
      })

      return {
        dom: summary,
        contentDOM: content,
        update(node) {
          return node.type.name === 'details'
        },
        ignoreMutation: () => true,
      }
    },
  })
}

function defineDetailsHostView() {
  return defineNodeView({
    name: 'details',
    constructor(node, view, getPos) {
      const details = document.createElement('details')

      details.classList.add(styles.details)
      details.setAttribute('custom', 'true')

      if (node.attrs['open']) {
        details.open = true
      }

      details.addEventListener('click-summary', (event) => {
        const { open } = node.attrs
        const tr = view.state.tr.setNodeMarkup(getPos()!, undefined, {
          ...node.attrs,
          open: !open,
        })
        view.dispatch(tr)
      })

      return {
        dom: details,
        contentDOM: details,
        // update(node) {
        //   return node.type.name === 'details'
        // },
        ignoreMutation: () => true,
        // stopEvent: (event) => {
        //   return true
        // },
      }
    },
  })
}
