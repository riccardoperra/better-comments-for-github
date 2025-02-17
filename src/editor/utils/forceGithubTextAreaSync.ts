export function forceGithubTextAreaSync(textarea: HTMLTextAreaElement) {
  const event = new Event('change', {
    bubbles: true,
    composed: true,
  })
  Object.assign(event, {
    isDefaultPrevented: () => false,
  })
  Object.defineProperty(event, 'target', {
    writable: false,
    value: textarea,
  })
  for (const key in textarea) {
    if (key.includes('__reactProps')) {
      const fiberProps = textarea[key as keyof typeof textarea] as Record<
        string,
        any
      >
      if (
        fiberProps &&
        'onChange' in fiberProps &&
        typeof fiberProps.onChange === 'function'
      ) {
        fiberProps.onChange(event)
      }

      break
    }
  }
}
