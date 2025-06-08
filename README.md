<p align="center">
    <img src="./brand/logo_512x512.png" alt="Logo" width="64">
</p>
<h1 align="center">
    Better comments for GitHub
</h1>

<p align="center">
  <i>Ever spent too much time writing a decent review, issue comment, or discussion?
  <br>What if the GitHub comment box could work better?</i> <span>👀</span> 
</p>

<p align="center">
An extension that <strong>completely replaces</strong> the GitHub native comment box, <br>
to a new <strong>block-based</strong> editor and a seamless real-time preview experience. 
</p>

<p align="center">
<img src="./brand/github_image.png" width="500" alt="Promotional image">
</p>

> [!IMPORTANT]
>
> This project is not affiliated with GitHub, Inc. in any way. It is an open source project that just aims to
> improve commenting on GitHub.
> Some data is retrieved via http calls, but no http calls are made using personal data or anything else.

## Install

[link-chrome]: https://chrome.google.com/webstore/detail/better-comments-for-githu/hkpjbleacapfcfeneimhmcipjkfbgdpg 'Version published on Chrome Web Store'

[<img src="https://raw.githubusercontent.com/alrra/browser-logos/90fdf03c/src/chrome/chrome.svg" width="48" alt="Chrome" valign="middle">][link-chrome] [<img valign="middle" src="https://img.shields.io/chrome-web-store/v/hkpjbleacapfcfeneimhmcipjkfbgdpg.svg?label=%20">][link-chrome]
and other Chromium browsers

Or install manually:

- Download the [latest release](https://github.com/riccardoperra/better-comments-for-github/releases/latest) or
  any [other version](https://github.com/riccardoperra/better-comments-for-github/releases) from the release page
- Load the unpacked extension
    - In chrome, go to `chrome://extensions`, then drag the zip into the page or just click on "Load unpacked" and
      select the zip file.

## Project structure

This project is subdivided into several sub packages:

- **brand**: contains the branding assets, such as logos, promotional assets published in web store.
- **markdown-schema**: a package that contains the markdown proseMirror nodes used by the editor.
- **markdown-transformer**: a package that contains the logic to transform the markdown schema into ProseMirror and vice
  versa.
- **src**: the source code of the editor
- **extension**: the extension package, responsible to inject the editor into GitHub pages and handle the extension
  logic.

> [!NOTE]
>
> Anyway, the project structure will change in the future in order to have the root package.json cleaner.

## Stack

Built with the following `core` technologies:

- [WXT Extension Framework](https://github.com/wxt-dev/wxt)

#### Editor

- [ProseMirror](https://prosemirror.net/)
- [prosekit](https://github.com/prosekit/prosekit)
- [unified](https://github.com/unifiedjs/unified)

Some of my core own libraries:

- [statebuilder](https://github.com/riccardoperra/statebuilder)
- [prosemirror-processor](https://github.com/riccardoperra/prosemirror-processor)

#### UI

- [SolidJS](https://github.com/solidjs/solid)
- [Kobalte](https://kobalte.dev)
- GitHub Primer CSS variables

## Running the project

- Install the dependencies via `pnpm install`
- Build core libs via `pnpm build:core-libs` (or build them individually)
- Run the extension via `pnpm run dev:extension`

## Features mapping

> [!CAUTION]
>
> Work in progress

### Basic formatting syntax

| Feature                             | Status | Notes                                |
|-------------------------------------|--------|--------------------------------------|
| Headings                            | ✅      |                                      |
| Bold                                | ✅      |                                      |
| Italic                              | ✅      |                                      |
| Strikethrough                       | ✅      |                                      |
| Bold and nested italic              | ✅      |                                      |
| All bold and italic                 | ⚠️     | Input rule `***` not supported yet   |
| Subscript                           | ✅      |                                      |
| Superscript                         | ✅      |                                      |
| Underline                           | ✅      |                                      |
| Quoting text                        | ✅      |                                      |
| Quoting code                        | ✅      |                                      |
| Color models                        | ❌️     |                                      |
| Links                               | ✅      |                                      |
| Autolink for valid url              | ✅️     |                                      |
| Section links                       | ❌️     | I don't think this will be supported |
| Relative links                      | ❌️     |                                      |
| Custom anchors                      | ❌️     |                                      |
| Line breaks                         | ✅️     |                                      |
| Images                              | ✅️     |                                      |
| Lists                               | ✅️     |                                      |
| Nested lists                        | ✅️     |                                      |
| Task lists                          | ✅️     |                                      |
| Mentioning                          | ✅️     |                                      |
| References issues and pull requests | ⚠️     |                                      |
| Referencing external resources      | ❌️     |                                      |
| Uploading assets                    | ✅️     |                                      |
| Emoji                               | ✅      | Custom emoji currently not supported |
| Paragraphs                          | ✅️     |                                      |
| Footnotes                           | ❌️     |                                      |
| Alerts                              | ✅️     |                                      |
| Hiding content with comments        | ✅️     |                                      |

### Advanced formatting

| Feature                 | Status | Notes |
|-------------------------|--------|-------|
| Table                   | ✅️     |       |
| Collapsed section       | ✅️     |       |
| Code blocks             | ✅️     |       |
| Diagrams                | ❌️     |       |
| Auto linked references  | ⚠️     |       |
| Attach files            | ✅️     |       |
| Permanent links to code | ❌️     |       |
| Saved replies           | ❌️     |       |


