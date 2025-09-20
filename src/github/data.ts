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

import type { SuggestionData } from '../editor/utils/loadSuggestionData'

export function fetchEmojis(url: string) {
  return fetch(url)
}

export function fetchMentionableUsers(url: string): Promise<
  Array<{
    type: 'user'
    id: number
    name: string
    participant: boolean
    login: string
  }>
> {
  return fetch(url, {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      Accept: 'application/json',
    },
  }).then((result) => result.json())
}

export function fetchIssues(url: string): Promise<{
  icons: Record<string, string>
  suggestions: Array<{
    id: number
    number: number
    title: string
    type: string
  }>
}> {
  return fetch(url, {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      Accept: 'application/json',
    },
  }).then((result) => result.json())
}

export function fetchEmojisImages(): Promise<Record<string, string>> {
  return fetch('https://api.github.com/emojis', {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      Accept: 'application/json',
    },
  }).then((result) => result.json())
}

export async function tryGetReferences(
  url: string,
): Promise<SuggestionData['references']> {
  try {
    const referenceData = await fetchIssues(url)
    const iconMap = referenceData.icons
    return referenceData.suggestions.map((reference) => ({
      id: reference.number.toString(),
      titleText: reference.title,
      titleHtml: reference.title,
      iconHtml: iconMap[reference.type],
    }))
  } catch {
    return []
  }
}

export function getUserAvatarId(userId: number) {
  return `https://avatars.githubusercontent.com/u/${userId}?v=4`
}

export async function getImagePreviewUrl(
  href: string,
  project: string,
  repository: string,
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const formData = new FormData()
    formData.set('text', `<img src="${href}" />`)
    formData.set('project', project)
    formData.set('issue', project)
    formData.set('repository', repository)
    formData.set('subject_type', 'issue')

    fetch('/preview', {
      body: formData,
      method: 'POST',
      headers: { 'GitHub-Verified-Fetch': 'true' },
    }).then(async (response) => {
      if (!response.ok) {
        reject(new Error('Failed to parse response'))
      }
      const htmlText = await response.text()

      const getUrlFromHtml = (html: string) => {
        const regex = /https:\/\/[^"'\s]+/i
        const match = html.match(regex)
        return match ? match[0] : null
      }

      resolve(getUrlFromHtml(htmlText)!)
    })
  })
}

export function getUserHoverCardContent(username: string, subjectTag: string) {
  const url = `https://github.com/users/${username}/hovercard?subject=pull_request:${subjectTag}&current_path=${window.location.pathname}`
  return fetch(url, {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  }).then((res) => res.text())
}

export function getPullRequestHoverCardContent(
  path: string,
  subjectTag: string,
) {
  const url = `${path}/hovercard?pull_request:${subjectTag}&current_path=${window.location.pathname}`
  return fetch(url, {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  }).then((res) => res.text())
}

export function getDiscussionHoverCardContent(
  path: string,
  subjectTag: string,
) {
  const url = `${path}/hovercard?subject=issue:${subjectTag}&current_path=${window.location.pathname}`
  return fetch(url, {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  }).then((res) => res.text())
}

export function getIssueHoverCardContent(path: string, subjectTag: string) {
  const url = `${path}/hovercard?subject=issue:${subjectTag}&current_path=${window.location.pathname}`
  return fetch(url, {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  }).then((res) => res.text())
}
