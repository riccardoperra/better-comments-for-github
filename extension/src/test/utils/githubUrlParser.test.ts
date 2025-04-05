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

import { expect, test } from 'vitest'
import {
  DISCUSSION_PAGE,
  ISSUE_PAGE,
  NEW_DISCUSSION_PAGE,
  NEW_ISSUE_PAGE,
  PULL_REQUEST_FILES_PAGE,
  PULL_REQUEST_PAGE,
  isDiscussionPage,
  isIssuePage,
  isNewDiscussionPage,
  isNewIssuePage,
  isPullRequestFilesPage,
  isPullRequestPage,
  parseGitHubUrl,
} from '../../utils/githubUrlParser'

test('identifies a new issue page', () => {
  const pathName = '/riccardoperra/better-writer-for-github/issues/new'
  const result = parseGitHubUrl(pathName)
  expect(isNewIssuePage(result.flags)).toBe(true)
  expect(noOtherPatternsMatch(result.flags, NEW_ISSUE_PAGE)).toBe(true)
})

test('identifies an issue page', () => {
  const pathName = '/riccardoperra/better-writer-for-github/issues/123'
  const result = parseGitHubUrl(pathName)
  expect(isIssuePage(result.flags)).toBe(true)
  expect(noOtherPatternsMatch(result.flags, ISSUE_PAGE)).toBe(true)
})

test('identifies a pull request page', () => {
  const pathName = '/riccardoperra/better-writer-for-github/pull/8'
  const result = parseGitHubUrl(pathName)
  expect(isPullRequestPage(result.flags)).toBe(true)
  expect(noOtherPatternsMatch(result.flags, PULL_REQUEST_PAGE)).toBe(true)
})

test('identifies a pull request files page', () => {
  const pathName = '/riccardoperra/better-writer-for-github/pull/8/files'
  const result = parseGitHubUrl(pathName)
  expect(isPullRequestFilesPage(result.flags)).toBe(true)
  expect(noOtherPatternsMatch(result.flags, PULL_REQUEST_FILES_PAGE)).toBe(true)
})

test('identifies a discussion page', () => {
  const pathName = '/riccardoperra/better-writer-for-github/discussions/619'
  const result = parseGitHubUrl(pathName)
  expect(isDiscussionPage(result.flags)).toBe(true)
  expect(noOtherPatternsMatch(result.flags, DISCUSSION_PAGE)).toBe(true)
})

test('identifies a new discussion page', () => {
  const pathName = '/riccardoperra/better-writer-for-github/discussions/new'
  const result = parseGitHubUrl(pathName)
  expect(isNewDiscussionPage(result.flags)).toBe(true)
  expect(
    noOtherPatternsMatch(result.flags, NEW_DISCUSSION_PAGE | DISCUSSION_PAGE),
  ).toBe(true)
})

test('extracts repository owner and name', () => {
  const pathName = '/riccardoperra/better-writer-for-github/issues/123'
  const result = parseGitHubUrl(pathName)
  expect(result.repositoryOwner).toBe('riccardoperra')
  expect(result.repository).toBe('better-writer-for-github')
})

test('returns false for all patterns if path does not match any pattern', () => {
  const pathName = '/riccardoperra/better-writer-for-github/unknown/path'
  const result = parseGitHubUrl(pathName)
  expect(result.flags).toBe(0)
})

function noOtherPatternsMatch(flags: number, expectedFlag: number) {
  const allFlags =
    NEW_ISSUE_PAGE |
    ISSUE_PAGE |
    PULL_REQUEST_PAGE |
    PULL_REQUEST_FILES_PAGE |
    DISCUSSION_PAGE |
    NEW_DISCUSSION_PAGE
  return (flags & ~expectedFlag & allFlags) === 0
}
