<h1 align="center">
    Leave better comments for GitHub
</h1>

<p align="center">
  <i>Ever spent too much time writing a decent review, issue comment, or discussion?
  <br>What if the GitHub comment box could work better?</i> <span>👀</span> 
</p>

<p align="center">
An extension that <strong>completely replaces</strong> the GitHub native comment box, <br>
to a new <strong>block-based</strong> editor and a seamless real-time preview experience. 
</p>

<img src="./assets/promo4.png" alt="Promotional image">

> [!IMPORTANT]
>
> This project is not affiliated with GitHub, Inc. in any way. It is an open source project that just aims to
> improve commenting on GitHub.
> Some data is retrieved via http calls, but no http calls are made using personal data or anything else.

## Install

<a href="">

![Chrome Web Store Version](https://img.shields.io/chrome-web-store/v/leave-better-comments-for-github?style=flat&label=%20&color=%230d61b5)
Install on Chrome and other chromium browsers

</a>

<a href="">

![Chrome Web Store Version](https://img.shields.io/chrome-web-store/v/leave-better-comments-for-github?style=flat&label=%20&color=%230d61b5)
Install on Firefox

</a>

<a href="">

![Chrome Web Store Version](https://img.shields.io/chrome-web-store/v/leave-better-comments-for-github?style=flat&label=%20&color=%230d61b5)
Install on Safari (Mac, iOS and iPadOS)

</a>

## Features

### Support GitHub Flavored Markdown

The extension will add support to live editing with support
for [GitHub Flavored Markdown](https://github.github.com/gfm/).

### Slash Command

You can now use the slash command `/` to toggle a slash command

### More keymaps

Editor will support enhanced keymaps to add blocks with more ease.

### Code block editor

Thanks to WYSYWIG editor, you can now edit code blocks with ease with a custom code block with syntax highlighting (via
shiki).

### User mentions

You can mention users in comments with `@` and the extension will suggest users to mention.

### Issue references

You can reference issues in comments with `#` and the extension will suggest issues to reference

## Stack

This project is built with the following technologies:

- [WXT Extension Framework](https://github.com/wxt-dev/wxt)

#### Editor

- [ProseMirror](https://prosemirror.net/)
- [prosekit](https://github.com/prosekit/prosekit)
- [unified](https://github.com/unifiedjs/unified)

#### UI

- [SolidJS](https://github.com/solidjs/solid)
- [Kobalte](https://kobalte.dev)

## Features mapping

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
| Collapsed section       | ❌️     |       |
| Code blocks             | ✅️     |       |
| Diagrams                | ❌️     |       |
| Auto linked references  | ⚠️     |       |
| Attach files            | ✅️     |       |
| Permanent links to code | ❌️     |       |
| Saved replies           | ❌️     |       |


