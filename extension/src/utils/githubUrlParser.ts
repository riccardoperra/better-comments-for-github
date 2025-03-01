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

const newIssuePattern = /^\/[^/]+\/[^/]+\/issues\/new$/
const issuePattern = /^\/[^/]+\/[^/]+\/issues\/\d+$/
const pullPattern = /^\/[^/]+\/[^/]+\/pull\/\d+$/
const pullFilesPattern = /^\/[^/]+\/[^/]+\/pull\/\d+\/files$/
const discussionPattern = /^\/[^/]+\/[^/]+\/discussions\//
const newDiscussionPattern = /^\/[^/]+\/[^/]+\/discussions\/new$/

export const NEW_ISSUE_PAGE = 1 << 0
export const ISSUE_PAGE = 1 << 1
export const PULL_REQUEST_PAGE = 1 << 2
export const PULL_REQUEST_FILES_PAGE = 1 << 3
export const DISCUSSION_PAGE = 1 << 4
export const NEW_DISCUSSION_PAGE = 1 << 5

export function parseGitHubUrl(pathName: string) {
  const [, repositoryOwner, repository] = pathName.split('/')

  let flags = 0
  if (newIssuePattern.test(pathName)) flags |= NEW_ISSUE_PAGE
  if (issuePattern.test(pathName)) flags |= ISSUE_PAGE
  if (pullPattern.test(pathName)) flags |= PULL_REQUEST_PAGE
  if (pullFilesPattern.test(pathName)) flags |= PULL_REQUEST_FILES_PAGE
  if (discussionPattern.test(pathName)) flags |= DISCUSSION_PAGE
  if (newDiscussionPattern.test(pathName)) flags |= NEW_DISCUSSION_PAGE

  return {
    repositoryOwner,
    repository,
    flags,
  }
}

export function isNewIssuePage(flags: number) {
  return (flags & NEW_ISSUE_PAGE) !== 0
}

export function isIssuePage(flags: number) {
  return (flags & ISSUE_PAGE) !== 0
}

export function isPullRequestPage(flags: number) {
  return (flags & PULL_REQUEST_PAGE) !== 0
}

export function isPullRequestFilesPage(flags: number) {
  return (flags & PULL_REQUEST_FILES_PAGE) !== 0
}

export function isDiscussionPage(flags: number) {
  return (flags & DISCUSSION_PAGE) !== 0
}

export function isNewDiscussionPage(flags: number) {
  return (flags & NEW_DISCUSSION_PAGE) !== 0
}
