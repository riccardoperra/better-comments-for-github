/*
 * Copyright 2025 Riccardo Perra
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * you may obtain a copy of the License at
 */

// Mapping of Shiki language ids (from shiki/dist/langs.mjs) to the common
// filename extensions and special filenames associated with each language.
// If no extensions are known for a language, an empty array is provided.
export const shikiLanguageFileExtensions: Record<string, Array<string>> = {
  abap: [],
  'actionscript-3': [],
  ada: [],
  'angular-html': [],
  'angular-ts': [],
  apache: [],
  apex: [],
  apl: [],
  applescript: [],
  ara: [],
  asciidoc: ['.adoc'],
  asm: [],
  astro: [],
  awk: [],
  ballerina: [],
  bat: ['.bat'],
  beancount: [],
  berry: [],
  bibtex: [],
  bicep: ['.bicep'],
  blade: [],
  bsl: [],
  c: ['.c', '.h'],
  cadence: [],
  cairo: [],
  clarity: [],
  clojure: ['.clj', '.cljs', '.cljc'],
  cmake: ['CMakeLists.txt'],
  cobol: [],
  codeowners: ['CODEOWNERS'],
  codeql: [],
  coffee: ['.coffee'],
  'common-lisp': [],
  coq: [],
  cpp: ['.cpp', '.cc', '.cxx', '.hpp', '.hh', '.hxx'],
  crystal: [],
  csharp: ['.cs'],
  css: ['.css'],
  csv: ['.csv'],
  cue: [],
  cypher: [],
  d: [],
  dart: ['.dart'],
  dax: [],
  desktop: [],
  diff: ['.diff', '.patch'],
  docker: ['Dockerfile'],
  dotenv: ['.env'],
  'dream-maker': [],
  edge: [],
  elixir: ['.ex', '.exs'],
  elm: ['.elm'],
  'emacs-lisp': [],
  erb: ['.erb'],
  erlang: [],
  fennel: [],
  fish: [],
  fluent: [],
  'fortran-fixed-form': [],
  'fortran-free-form': [],
  fsharp: ['.fs', '.fsx'],
  gdresource: [],
  gdscript: [],
  gdshader: [],
  genie: [],
  gherkin: [],
  'git-commit': [],
  'git-rebase': [],
  gleam: [],
  'glimmer-js': [],
  'glimmer-ts': [],
  glsl: [],
  gnuplot: [],
  go: ['.go'],
  graphql: ['.graphql', '.gql'],
  groovy: [],
  hack: [],
  haml: [],
  handlebars: ['.hbs'],
  haskell: ['.hs'],
  haxe: [],
  hcl: ['.hcl'],
  hjson: [],
  hlsl: [],
  html: ['.html', '.htm'],
  'html-derivative': [],
  http: [],
  hxml: [],
  hy: [],
  imba: [],
  ini: ['.ini', '.properties'],
  java: ['.java'],
  javascript: ['.js', '.mjs', '.cjs'],
  jinja: [],
  jison: [],
  json: ['.json'],
  json5: ['.json5'],
  jsonc: [],
  jsonl: ['.jsonl'],
  jsonnet: [],
  jssm: [],
  jsx: ['.jsx'],
  julia: ['.jl'],
  kotlin: ['.kt', '.kts'],
  kusto: [],
  latex: ['.tex'],
  lean: [],
  less: ['.less'],
  liquid: [],
  llvm: [],
  log: [],
  logo: [],
  lua: ['.lua'],
  luau: [],
  make: ['Makefile'],
  markdown: ['.md'],
  marko: [],
  matlab: [],
  mdc: [],
  mdx: ['.mdx'],
  mermaid: [],
  mipsasm: [],
  mojo: [],
  move: [],
  narrat: [],
  nextflow: [],
  nginx: [],
  nim: [],
  nix: [],
  nushell: [],
  'objective-c': ['.m', '.mm'],
  'objective-cpp': [],
  ocaml: [],
  pascal: [],
  perl: ['.pl', '.pm'],
  php: ['.php'],
  plsql: [],
  po: [],
  polar: [],
  postcss: [],
  powerquery: [],
  powershell: ['.ps1'],
  prisma: [],
  prolog: [],
  proto: ['.proto'],
  pug: [],
  puppet: [],
  purescript: [],
  python: ['.py'],
  qml: [],
  qmldir: [],
  qss: [],
  r: [],
  racket: [],
  raku: [],
  razor: [],
  reg: [],
  regexp: [],
  rel: [],
  riscv: [],
  rst: [],
  ruby: ['.rb'],
  rust: ['.rs'],
  sas: [],
  sass: [],
  scala: [],
  scheme: [],
  scss: [],
  sdbl: [],
  shaderlab: [],
  shellscript: ['.sh'],
  shellsession: [],
  smalltalk: [],
  solidity: ['.sol'],
  soy: [],
  sparql: [],
  splunk: [],
  sql: ['.sql'],
  'ssh-config': [],
  stata: [],
  stylus: [],
  svelte: [],
  swift: ['.swift'],
  'system-verilog': [],
  systemd: [],
  talonscript: [],
  tasl: [],
  tcl: [],
  templ: [],
  terraform: ['.tf'],
  tex: [],
  toml: ['.toml'],
  'ts-tags': [],
  tsv: [],
  tsx: ['.tsx'],
  turtle: [],
  twig: [],
  typescript: ['.ts'],
  typespec: [],
  typst: [],
  v: [],
  vala: [],
  vb: [],
  verilog: [],
  vhdl: [],
  viml: [],
  vue: ['.vue'],
  'vue-html': [],
  'vue-vine': [],
  vyper: [],
  wasm: [],
  wenyan: [],
  wgsl: [],
  wikitext: [],
  wit: [],
  wolfram: [],
  xml: ['.xml'],
  xsl: [],
  yaml: ['.yaml', '.yml'],
  zenscript: [],
  zig: ['.zig'],
}

// We intentionally keep the mapping as Record<string, Array<string>> and use
// plain string for language ids to avoid tight coupling with external types.

/**
 * Return the list of extensions/filenames associated with a Shiki language id.
 */
export function extensionsForLanguage(id: string): Array<string> {
  return shikiLanguageFileExtensions[id] ?? []
}

/**
 * Try to detect a Shiki language id from a given filename.
 *
 * Detection rules (simple, ordered):
 * 1) Exact filename match (e.g. "Dockerfile", "Makefile", "CMakeLists.txt")
 * 2) Extension match (case-insensitive) for entries starting with a dot
 *
 * Returns the first matching language id or null when none found.
 */
export function detectLanguageFromFilename(filename: string): string | null {
  if (!filename) return null

  const lower = filename.toLowerCase()

  // 1) Exact filename checks (match on lowercased keys that don't start with a dot)
  for (const [lang, patterns] of Object.entries(shikiLanguageFileExtensions)) {
    for (const pattern of patterns) {
      if (!pattern.startsWith('.') && pattern.toLowerCase() === lower) {
        return lang
      }
    }
  }

  // 2) Extension check
  const lastDot = filename.lastIndexOf('.')
  const ext = lastDot !== -1 ? filename.slice(lastDot).toLowerCase() : ''
  if (ext) {
    for (const [lang, patterns] of Object.entries(
      shikiLanguageFileExtensions,
    )) {
      for (const pattern of patterns) {
        if (pattern.startsWith('.') && pattern.toLowerCase() === ext) {
          return lang
        }
      }
    }
  }

  return null
}
