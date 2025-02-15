export function forceGithubTextAreaSync(textarea: HTMLTextAreaElement) {
  textarea.dispatchEvent(new Event('change', { bubbles: true }))
}
