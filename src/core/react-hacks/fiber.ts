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

export type Fiber = any

export function traverseFiber<T = any>(
  fiber: Fiber,
  ascending: boolean,
  selector: (fiber: Fiber) => boolean | undefined,
): Fiber | null {
  if (!fiber) return
  if (selector(fiber) === true) return fiber

  let child = ascending ? fiber.return : fiber.child
  while (child) {
    const match = traverseFiber(child, ascending, selector)
    if (match) return match

    child = ascending ? null : child.sibling
  }
}

export function getFiber(element: HTMLElement): Fiber | null {
  let fiber: Fiber
  for (const key in element) {
    if (key.includes('__reactFiber')) {
      fiber = element[key as keyof typeof element] as Record<string, any> | null
      return fiber
    }
  }
  return fiber
}

export function getFiberProps<
  T extends Record<string, any> = Record<string, any>,
>(element: HTMLElement): Partial<T> | null {
  let fiber: Fiber
  for (const key in element) {
    if (key.includes('__reactProps')) {
      fiber = element[key as keyof typeof element] as Record<string, any> | null
      return fiber
    }
  }
  return fiber
}

export async function waitForReactFiber(
  element: HTMLElement,
  interval = 150,
  timeout = 3000,
) {
  return new Promise<Fiber>((resolve, reject) => {
    const startTime = Date.now()

    function check() {
      if (!element) {
        reject(new Error('Element not found'))
        return
      }
      const fiber = getFiber(element)
      if (fiber) {
        resolve(fiber)
        return
      }
      if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for React Fiber'))
        return
      }
      setTimeout(check, interval)
    }
    check()
  })
}
