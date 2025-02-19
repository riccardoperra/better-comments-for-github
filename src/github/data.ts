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

export function getUserAvatarId(userId: number) {
  return `https://avatars.githubusercontent.com/u/${userId}?v=4`
}
