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

import { createComponent } from 'solid-js'
import { SwitchButton } from '../../../src/render'
import type { Accessor, ComponentProps, Setter } from 'solid-js'
import type { GitHubUrlParsedResult } from './githubUrlParser'
import type { SuggestionData } from '../../../src/editor/utils/loadSuggestionData'

export interface GithubPageInstanceResult {
  readonly currentUsername: Accessor<string | null>
  readonly parsedUrl: Accessor<GitHubUrlParsedResult | null>
  readonly addInstance: (instance: GitHubEditorInstance) => void
  readonly removeInstance: (instance: GitHubEditorInstance) => void
  readonly instances: Array<GitHubEditorInstance>
  readonly removeAllInstances: () => void
}

export interface GitHubPageInstanceOptions {
  readonly onReady?: (this: GithubPageInstanceResult, event: Event) => void
  readonly onDestroy?: (this: GithubPageInstanceResult, event: Event) => void
}

export interface GitHubEditorInstance {
  rootElement: HTMLElement
  suggestionData: Accessor<SuggestionData>
  setInjector: (injector: GitHubEditorInjector) => void
  setSuggestionData: Setter<SuggestionData>
  showOldEditor: Accessor<boolean>
  setShowOldEditor: Setter<boolean>
  textareaRef: Accessor<HTMLTextAreaElement | null>
  setTextareaRef: Setter<HTMLTextAreaElement | null>
  unmount: () => void
  switchButton: {
    render: (
      root: HTMLElement,
      props?: Partial<ComponentProps<typeof SwitchButton>>,
    ) => () => void
    dispose: null | (() => void)
  }
  editorElement: {
    setDisposer: (dispose: () => void) => void
    dispose: null | (() => void)
  }
}

export const $GITHUB_EDITOR_INSTANCE = Symbol('GITHUB_EDITOR_INSTANCE')

export function registerGitHubEditorInstance(
  page: GithubPageInstanceResult,
  instance: GitHubEditorInstance,
) {
  Reflect.set(instance.rootElement, $GITHUB_EDITOR_INSTANCE, instance)
  page.addInstance(instance)
}

export function removeGitHubEditorInstance(
  page: GithubPageInstanceResult,
  instance: GitHubEditorInstance,
) {
  Reflect.set(instance.rootElement, $GITHUB_EDITOR_INSTANCE, null)

  instance.switchButton.dispose?.()
  instance.editorElement.dispose?.()
  instance.unmount()
  page.removeInstance(instance)
}

export function getGitHubEditorInstanceFromElement(el: Element) {
  const instance = Reflect.get(el, $GITHUB_EDITOR_INSTANCE)
  if (!instance) {
    return null
  }
  return instance as GitHubEditorInstance
}

export function createGitHubEditorInstance(
  el: HTMLElement,
  ownerDisposer: () => void,
): GitHubEditorInstance {
  const [textareaRef, setTextareaRef] =
    createSignal<HTMLTextAreaElement | null>(null)
  const [showOldEditor, setShowOldEditor] = createSignal<boolean>(true)
  const [suggestionData, setSuggestionData] = createSignal<SuggestionData>({
    mentions: [],
    emojis: [],
    references: [],
    savedReplies: [],
  })

  let injector: GitHubEditorInjector | null = null
  let disposeSwitch: (() => void) | null = null
  let disposeEditorInstance: (() => void) | null = null

  function renderSwitch(
    root: HTMLElement,
    props?: Partial<ComponentProps<typeof SwitchButton>>,
  ) {
    const dispose = render(
      () =>
        createComponent(SwitchButton, {
          get open() {
            return showOldEditor()
          },
          onOpenChange: (open) => {
            setShowOldEditor(open)
          },
          size: props?.size ?? 'small',
          variant: props?.variant ?? 'invisible',
        }),
      root,
    )
    disposeSwitch = () => {
      dispose()
      disposeSwitch = null
      root.remove()
    }
    return disposeSwitch
  }

  const unmount = () => {
    disposeSwitch?.()
    disposeSwitch = null

    disposeEditorInstance?.()
    disposeEditorInstance = null

    setTextareaRef(null)
    ownerDisposer()

    injector?.destroy()
    injector = null
  }

  return {
    unmount,
    rootElement: el,
    showOldEditor,
    setShowOldEditor,
    suggestionData,
    setSuggestionData,
    textareaRef,
    setTextareaRef,
    setInjector: (_injector) => {
      injector = _injector
    },
    switchButton: {
      render: renderSwitch,
      get dispose() {
        return disposeSwitch
      },
    },
    editorElement: {
      setDisposer: (dispose) => {
        disposeEditorInstance = () => {
          dispose()
          disposeEditorInstance = null
        }
      },
      get dispose() {
        return disposeEditorInstance
      },
    },
  }
}

export function createGitHubPageInstance(
  options: GitHubPageInstanceOptions,
): GithubPageInstanceResult {
  let instances: Array<GitHubEditorInstance> = []

  const [currentUsername, setCurrentUsername] = createSignal<string | null>(
    null,
  )
  const [parsedUrl, setParsedUrlResult] =
    createSignal<GitHubUrlParsedResult | null>(null)

  const result: GithubPageInstanceResult = {
    currentUsername,
    parsedUrl,
    addInstance: (item) => instances.push(item),
    removeInstance: (item) => (instances = instances.filter((i) => i !== item)),
    removeAllInstances() {
      for (const instance of instances) {
        instance.unmount()
      }
      instances = []
    },
    get instances() {
      return instances
    },
  }

  function loadUsername() {
    setCurrentUsername(retrieveCurrentUsername())
  }

  function loadParsedUrl() {
    const result = parseGitHubUrl(window.location.pathname)
    setParsedUrlResult(result)
  }

  // Will fire after the first page load, and immediately after turbo:visit
  document.addEventListener('turbo:load', (event) => {
    loadUsername()
    loadParsedUrl()
    options.onReady?.call(result, event)
  })

  // Will fire after a link which will redirect to a new gh page has been clicked
  // document.addEventListener('turbo:click', (event) => {
  //   options.onDestroy?.call(result, event)
  // })

  // https://turbo.hotwired.dev/reference/events#turbo%3Abefore-cache
  document.addEventListener('turbo:before-cache', (event) => {
    options.onDestroy?.call(result, event)
  })

  // Will fire after gh page has been changed
  // document.addEventListener('turbo:visit', (event) => {})

  // document.addEventListener('turbo:render', (event) => {})

  return result
}

function retrieveCurrentUsername() {
  const { head } = document
  const meta: HTMLMetaElement | null =
    head.querySelector('meta[name="user-login"]') ??
    head.querySelector('meta[name="octolytics-actor-login"]')
  if (!meta) {
    return null
  }
  return meta.content
}
