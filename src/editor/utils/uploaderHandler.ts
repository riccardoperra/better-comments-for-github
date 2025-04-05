import { getImagePreviewUrl } from '../../github/data'
import type { GitHubFile } from '../../core/editor/image/github-file-uploader'

export interface GitHubUploaderHandler {
  init: (originalFile: File) => GitHubFile

  upload: (file: GitHubFile, dataTransfer: DataTransfer | null) => void

  get: ReadonlyArray<GitHubFile>
}

const getUrlFromHtml = (html: string) => {
  const regex = /https:\/\/[^"'\s]+/i
  const match = html.match(regex)
  return match ? match[0] : null
}

export async function loadImagePreview(href: string): Promise<string> {
  const repositoryId = document.querySelector<HTMLMetaElement>(
    'meta[name="octolytics-dimension-repository_id"]',
  )?.content
  const projectId = document
    .querySelector<HTMLMetaElement>('meta[name="hovercard-subject-tag"]')
    ?.content.replace('issue:', '')
  const htmlText = await getImagePreviewUrl(href, projectId!, repositoryId!)
  return getUrlFromHtml(htmlText)!
}
