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

import type { GitHubIssueReferenceAttrs } from './issue'

const typeToLinkMapping = {
  pull: 'pull',
  issue: 'issues',
  discussion: 'discussions',
} as const

const linkToTypeMapping = {
  pull: 'pull',
  issues: 'issue',
  discussions: 'discussion',
} as const satisfies Record<string, string>

export function getLinkFromIssueReferenceAttrs(
  attrs: Omit<GitHubIssueReferenceAttrs, 'href'>,
) {
  const linkType = typeToLinkMapping[attrs.type] || 'issues'
  return `https://github.com/${attrs.owner}/${attrs.repository}/${linkType}/${attrs.issue}`
}

export function getIssueReferenceTypeAttrFromLink(
  type: (string & {}) | 'pull' | 'issues' | 'discussions',
) {
  return (linkToTypeMapping as any)[type] || 'issue'
}
