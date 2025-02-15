export function waitForElement(
  selector: string,
  parentNode: HTMLElement | null = null,
  timeout: number | null = null,
): Promise<Element> {
  return new Promise((resolve, reject) => {
    if (!selector) reject('no selector')
    if (!parentNode) parentNode = globalThis.document.body
    for (const res = parentNode.querySelector(selector); ; ) {
      if (res) return resolve(res)
      break
    }
    let timeoutId: number | null = null
    const observer = new MutationObserver((mutations) => {
      const res = [...mutations[0].addedNodes].find((node) =>
        (node as Element).matches(selector),
      )
      if (res) {
        if (timeoutId) clearTimeout(timeoutId)
        observer.disconnect()
        resolve(res)
      }
    })
    timeoutId = timeout
      ? setTimeout(() => {
          observer.disconnect()
          reject('timeout')
        }, timeout)
      : null
    // If you get "parameter 1 is not of type 'Node'" error
    // see https://stackoverflow.com/a/77855838/492336
    observer.observe(parentNode, {
      childList: true,
      subtree: true,
    })
  })
}
