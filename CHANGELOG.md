# @better-comments-for-github/core

## 0.0.16

### Patch Changes

- e0a0d6d: Add support for code suggestion

## 0.0.15

### Patch Changes

- 21bc98f: Improve table cell with line breaks support and fix rendering on markdown
- Updated dependencies [21bc98f]
  - prosemirror-transformer-markdown@1.0.1
  - @prosedoc/markdown-schema@1.0.2

## 0.0.14

### Patch Changes

- 2f28915: Add support for auto-linking while pasting an html link into a text selection

## 0.0.13

### Patch Changes

- f46da87: Task lists preceded by a slash were not parsed correctly
- 45b1e6c: fix editor autofocus issues while opening a preloaded editor (mostly pr pages)

## 0.0.12

### Patch Changes

- a0d740b: Fix infinite loop when opening textarea in draft mode with ts code block

## 0.0.11

### Patch Changes

- 592f8cf: fix codemirror editor worker loading after comment

## 0.0.10

### Patch Changes

- 1ffd74c: Add table handlers
- Updated dependencies [1ffd74c]
  - @prosedoc/markdown-schema@1.0.1

## 0.0.9

### Patch Changes

- 7d5d4b8: Improve parsing for references that contain a comment id

## 0.0.8

### Patch Changes

- 29b475d: Reply is not resetted on discussion page after submit

## 0.0.7

### Patch Changes

- b176734: Minor fix

## 0.0.6

### Patch Changes

- 29f3305: Improvements for CodeMirror node arrow navigation

## 0.0.5

### Patch Changes

- 2875669: Slash menu add animations and filtering improvements

## 0.0.4

### Patch Changes

- b7d3a53: Add support for discussion reference
- 73213f8: Add issue&feedback button, fix slash menu regex

## 0.0.3

### Patch Changes

- 3de0d31: Add support for CodeMirror editor with ATA while using typescript
- e7fec31: Add support for Release page

## 0.0.2

### Patch Changes

- 747ccb4: fix button switch not working in some pages

## 0.0.1

### Patch Changes

- ec7cc42: Refactor editor detection implementation
  - Support multiple parents when slash-command-feature is disabled
  - Fix an issue where editor was loaded twice for the same textarea
