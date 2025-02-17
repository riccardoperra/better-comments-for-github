# @prosedoc/markdown-schema

Markdown schema specification for ProseMirror implementation.

## Support for basic syntax

https://www.markdownguide.org/basic-syntax/

- [x] [Headings](./src/heading)
- [x] [Paragraphs](./src/paragraph)
- [x] Line breaks
- [x] Emphasis
  - [x] [Bold](./src/bold)
  - [x] [Italic](./src/italic)
- [x] [Blockquotes](./src/blockquote/)
  - [x] Blockquotes with multiple paragraphs
  - [x] Nested blockquotes
  - [x] Blockquotes with other elements
- [ ] List
  - [ ] Ordered lists
  - [ ] Unordered lists
- [x] [Code](./src/code)
- [x] [Horizontal rule](./src/horizontalRule)
- [x] [Links](./src/link)
  - [x] Titles
  - [ ] Reference links
- [ ] Images
- [ ] HTML?

## Support for advanced syntax

https://www.markdownguide.org/extended-syntax/

- [x] [Tables](./src/table/)
- [x] [Fenced code blocks](./src/codeBlock)
- [ ] Footnotes
- [ ] Heading ids
- [ ] Definition lists
- [x] [Strikethrough](./src/strikethrough)
- [ ] Task lists
- [ ] Emoji
- [ ] Highlight
- [ ] Subscript
- [ ] Superscript
- [ ] Automatic URL linking
