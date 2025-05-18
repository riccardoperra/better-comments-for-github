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

import type { GitHubUrlParsedResult } from './githubUrlParser'
import type { Accessor } from 'solid-js'

export interface GithubPageInstanceResult {
  readonly currentUsername: Accessor<string | null>
  readonly parsedUrl: Accessor<GitHubUrlParsedResult | null>
  readonly addInstance?: (instance: GitHubEditorInstance) => void
  readonly removeInstance?: (instance: GitHubEditorInstance) => void
}

export interface GitHubPageInstanceOptions {
  readonly onReady?: (this: GithubPageInstanceResult, event: Event) => void
  readonly onClickLink?: (this: GithubPageInstanceResult, event: Event) => void
}

export interface GitHubEditorInstance {
  el: HTMLElement
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
  document.addEventListener('turbo:click', (event) => {
    options.onClickLink?.call(result, event)
  })

  // Will fire after gh page has been changed
  document.addEventListener('turbo:visit', (event) => {})

  document.addEventListener('turbo:render', (event) => {})

  return {
    currentUsername,
    parsedUrl,
  }
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
