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

import { createComputed, createSignal } from 'solid-js'

function matchAll(selectors: string | Array<string>, parentNode: HTMLElement) {
  return (
    [selectors]
      .flat()
      // I know could just join the selectors with a comma, but I need to preserve the order of the given selectors.
      .flatMap((selector) => [...parentNode.querySelectorAll(selector)])
  )
}

export function query(
  selectors: string | Array<string>,
  parentNode: HTMLElement | null = null,
  options?: {
    onAdded?: (el: HTMLElement) => void
    onRemoved?: (el: HTMLElement) => void
  },
) {
  const [elements, setElements] = createSignal<Array<HTMLElement>>([], {
    equals: (prev, next) => {
      if (prev.length !== next.length) return false
      const prevSet = new Set(prev)
      return next.every((el) => prevSet.has(el))
    },
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

  const elementsOnInit = matchAll(selectors, parentNode)
  setElements(() => Array.from(elementsOnInit) as Array<HTMLElement>)

  function handle(node: Node, array: Array<HTMLElement>) {
    let matchedNode: HTMLElement | null = null
    if ('matches' in node) {
      const selectorsToMatch = [selectors].flat()
      for (const selector of selectorsToMatch) {
        if ((node as Element).matches(selector)) {
          matchedNode = node as HTMLElement
          break
        }
      }
    } else {
      if ('querySelector' in node) {
        matchedNode = matchAll(
          selectors,
          node as HTMLElement,
        )[0] as HTMLElement | null
      }
    }
    if (matchedNode) {
      array.push(matchedNode)
    }
  }

  function skipNode(node: Node) {
    if (
      ('tagName' in node &&
        typeof node.tagName === 'string' &&
        (node.tagName === 'SCRIPT' ||
          node.tagName === 'STYLE' ||
          node.tagName === 'LINK' ||
          node.tagName === 'INPUT' ||
          node.tagName === 'BUTTON' ||
          node.tagName === 'SPAN' ||
          node.tagName === 'INCLUDE-FRAGMENT' ||
          node.tagName === 'TOOL-TIP' ||
          node.tagName.startsWith('COPILOT-') ||
          node.tagName.startsWith('REACT-') ||
          node.tagName.startsWith('PROSEKIT-'))) ||
      node.nodeType === Node.TEXT_NODE
    ) {
      return true
    }
    return false
  }

  const observer = new MutationObserver((mutations) => {
    const addedEls: Array<HTMLElement> = []
    const removedEls: Array<HTMLElement> = []

    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (skipNode(node)) {
          return
        }
        handle(node, addedEls)
      })
      mutation.removedNodes.forEach((node) => {
        if (skipNode(node)) {
          return
        }
        handle(node, removedEls)
      })
    }

    setElements((els) => {
      const newElements = els
        .filter((el) => !removedEls.includes(el))
        .concat(addedEls)
      return [...new Set(newElements)]
    })
  })

  let previousElements: Array<HTMLElement> = []

  createComputed(() => {
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
      options?.onAdded?.(addedEl)
      onAddedListeners.forEach((fn) => fn(addedEl))
    }
    for (const removedEl of removedEls) {
      options?.onRemoved?.(removedEl)
      onAddedListeners.forEach((fn) => fn(removedEl))
    }

    previousElements = updatedElements
  })

  observer.observe(parentNode, {
    childList: true,
    subtree: true,
  })

  const dispose = () => {
    observer.disconnect()
    if (options?.onAdded) {
      options.onAdded = undefined
    }
    if (options?.onRemoved) {
      options.onRemoved = undefined
    }

    // setElements([])
  }

  return [elements, onAdded, onRemoved, dispose] as const
}
