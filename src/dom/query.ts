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

import { createEffect, createSignal } from 'solid-js'

export function query(selector: string, parentNode: HTMLElement | null = null) {
  const [elements, setElements] = createSignal<Array<HTMLElement>>([], {
    // equals: (prev, next) => {
    //   if (prev.length !== next.length) return false
    //   const prevSet = new Set(prev)
    //   return next.every((el) => prevSet.has(el))
    // },
  })

  const onAddedListeners = new Set<(el: HTMLElement) => void>()
  const onRemovedListeners = new Set<(el: HTMLElement) => void>()

  const onAdded = (fn: (el: HTMLElement) => void) => {
    onAddedListeners.add(fn)
    return () => onAddedListeners.delete(fn)
  }

  const onRemoved = (fn: (el: HTMLElement) => void) => {
    onRemovedListeners.add(fn)
    return () => onRemovedListeners.delete(fn)
  }

  if (!parentNode) {
    parentNode = globalThis.document.body
  }

  const elementsOnInit = parentNode.querySelectorAll(selector)
  console.log(elementsOnInit)
  setElements(() => Array.from(elementsOnInit) as Array<HTMLElement>)

  const observer = new MutationObserver((mutations) => {
    const addedEls: Array<HTMLElement> = []
    const removedEls: Array<HTMLElement> = []
    const addedNodes = []

    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if ('matches' in node && (node as Element).matches(selector)) {
          addedEls.push(node as HTMLElement)
        } else if ('querySelector' in node) {
          const matchedEl = (node as Element).querySelector<HTMLElement>(
            selector,
          )
          if (matchedEl) {
            addedEls.push(matchedEl)
          }
        }
        addedNodes.push(node)
      })
      mutation.removedNodes.forEach((node) => {
        if ('matches' in node && (node as Element).matches(selector)) {
          removedEls.push(node as HTMLElement)
        } else if ('querySelector' in node) {
          const matchedEl = (node as Element).querySelector<HTMLElement>(
            selector,
          )
          if (matchedEl) {
            removedEls.push(matchedEl)
          }
        }
      })
    }

    setElements((els) =>
      els.filter((el) => !removedEls.includes(el)).concat(addedEls),
    )
  })

  let previousElements: Array<HTMLElement> = []

  createEffect(() => {
    const updatedElements = elements()
    const addedEls: Array<HTMLElement> = []
    const removedEls: Array<HTMLElement> = []
    for (const el of updatedElements) {
      if (!previousElements.includes(el)) {
        addedEls.push(el)
      }
    }
    for (const el of previousElements) {
      if (!updatedElements.includes(el)) {
        removedEls.push(el)
      }
    }

    for (const addedEl of addedEls) {
      onAddedListeners.forEach((fn) => fn(addedEl))
    }
    for (const removedEl of removedEls) {
      onAddedListeners.forEach((fn) => fn(removedEl))
    }

    previousElements = updatedElements
  })

  observer.observe(parentNode, {
    childList: true,
    subtree: true,
  })

  return [elements, onAdded, onRemoved]
}
