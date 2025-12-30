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
  abap: ['.abap', '.cls'],
  'actionscript-3': ['.as'],
  ada: ['.adb', '.ads'],
  'angular-html': ['.component.html'],
  'angular-ts': ['.component.ts'],
  apache: ['.htaccess', '.conf'],
  apex: ['.cls', '.trigger'],
  apl: ['.apl'],
  applescript: ['.applescript', '.scpt'],
  ara: ['.ara'],
  asciidoc: ['.adoc', '.asciidoc'],
  asm: ['.asm', '.s'],
  astro: ['.astro'],
  awk: ['.awk'],
  ballerina: ['.bal'],
  bat: ['.bat'],
  beancount: ['.beancount'],
  berry: ['.berry'],
  bibtex: ['.bib'],
  bicep: ['.bicep'],
  blade: ['.blade.php'],
  bsl: ['.bsl'],
  c: ['.c', '.h'],
  cadence: ['.cdc'],
  cairo: ['.cairo'],
  clarity: ['.clar', '.cl'],
  clojure: ['.clj', '.cljs', '.cljc'],
  cmake: ['CMakeLists.txt'],
  cobol: ['.cob', '.cbl'],
  codeowners: ['CODEOWNERS'],
  codeql: ['.ql'],
  coffee: ['.coffee'],
  'common-lisp': ['.lisp', '.lsp'],
  coq: ['.v'],
  cpp: ['.cpp', '.cc', '.cxx', '.hpp', '.hh', '.hxx'],
  crystal: ['.cr'],
  csharp: ['.cs'],
  css: ['.css'],
  csv: ['.csv'],
  cue: ['.cue'],
  cypher: ['.cypher'],
  d: ['.d'],
  dart: ['.dart'],
  dax: ['.dax'],
  desktop: ['.desktop'],
  diff: ['.diff', '.patch'],
  docker: ['Dockerfile'],
  dotenv: ['.env'],
  'dream-maker': ['.dm', '.dme'],
  edge: ['.edge'],
  elixir: ['.ex', '.exs'],
  elm: ['.elm'],
  'emacs-lisp': ['.el'],
  erb: ['.erb'],
  erlang: ['.erl', '.hrl'],
  fennel: ['.fnl'],
  fish: ['.fish'],
  fluent: ['.ftl'],
  'fortran-fixed-form': ['.for', '.f'],
  'fortran-free-form': ['.f90', '.f95'],
  fsharp: ['.fs', '.fsx'],
  gdresource: ['.gresource'],
  gdscript: ['.gd'],
  gdshader: ['.gdshader'],
  genie: ['.gs'],
  gherkin: ['.feature'],
  'git-commit': ['COMMIT_EDITMSG'],
  'git-rebase': ['.git-rebase'],
  gleam: ['.gleam'],
  'glimmer-js': ['.gjs'],
  'glimmer-ts': ['.gts'],
  glsl: ['.glsl', '.vert', '.frag'],
  gnuplot: ['.gp', '.gnuplot'],
  go: ['.go'],
  graphql: ['.graphql', '.gql'],
  groovy: ['.groovy', '.gradle'],
  hack: ['.hh', '.hhi'],
  haml: ['.haml'],
  handlebars: ['.hbs'],
  haskell: ['.hs', '.lhs'],
  haxe: ['.hx'],
  hcl: ['.hcl'],
  hjson: ['.hjson'],
  hlsl: ['.hlsl', '.fx'],
  html: ['.html', '.htm'],
  'html-derivative': ['.htm', '.html'],
  http: ['.http'],
  hxml: ['.hxml'],
  hy: ['.hy'],
  imba: ['.imba'],
  ini: ['.ini', '.properties'],
  java: ['.java'],
  javascript: ['.js', '.mjs', '.cjs'],
  jinja: ['.jinja', '.j2', '.jinja2'],
  jison: ['.jison'],
  json: ['.json'],
  json5: ['.json5'],
  jsonc: ['.jsonc'],
  jsonl: ['.jsonl', '.ndjson'],
  jsonnet: ['.jsonnet', '.libsonnet'],
  jssm: ['.jssm'],
  jsx: ['.jsx'],
  julia: ['.jl'],
  kotlin: ['.kt', '.kts'],
  kusto: ['.kql'],
  latex: ['.tex'],
  lean: ['.lean'],
  less: ['.less'],
  liquid: ['.liquid'],
  llvm: ['.ll'],
  log: ['.log'],
  logo: ['.logo'],
  lua: ['.lua'],
  luau: ['.luau'],
  make: ['Makefile'],
  markdown: ['.md', '.markdown'],
  marko: ['.marko'],
  matlab: ['.m'],
  mdc: ['.mdc'],
  mdx: ['.mdx'],
  mermaid: ['.mmd'],
  mipsasm: ['.s', '.mips'],
  mojo: ['.mojo'],
  move: ['.move'],
  narrat: ['.narr'],
  nextflow: ['.nf'],
  nginx: ['nginx.conf'],
  nim: ['.nim'],
  nix: ['.nix'],
  nushell: ['.nu'],
  'objective-c': ['.m', '.mm'],
  'objective-cpp': ['.mm'],
  ocaml: ['.ml', '.mli'],
  pascal: ['.pas', '.pp'],
  perl: ['.pl', '.pm'],
  php: ['.php'],
  plsql: ['.pls', '.pkb', '.pks'],
  po: ['.po'],
  polar: ['.polar'],
  postcss: ['.pcss'],
  powerquery: ['.pq'],
  powershell: ['.ps1'],
  prisma: ['.prisma'],
  prolog: ['.pl', '.pro'],
  proto: ['.proto'],
  pug: ['.pug'],
  puppet: ['.pp'],
  purescript: ['.purs'],
  python: ['.py'],
  qml: ['.qml'],
  qmldir: ['qmldir'],
  qss: ['.qss'],
  r: ['.r'],
  racket: ['.rkt'],
  raku: ['.raku', '.rakumod', '.t'],
  razor: ['.cshtml'],
  reg: ['.reg'],
  regexp: ['.re'],
  rel: ['.rel'],
  riscv: ['.s'],
  rst: ['.rst'],
  ruby: ['.rb'],
  rust: ['.rs'],
  sas: ['.sas'],
  sass: ['.sass'],
  scala: ['.scala'],
  scheme: ['.scm', '.ss'],
  scss: ['.scss'],
  sdbl: ['.sdbl'],
  shaderlab: ['.shader'],
  shellscript: ['.sh'],
  shellsession: ['.sh-session'],
  smalltalk: ['.st'],
  solidity: ['.sol'],
  soy: ['.soy'],
  sparql: ['.rq', '.sparql'],
  splunk: ['.spl'],
  sql: ['.sql'],
  'ssh-config': ['ssh_config', 'sshd_config'],
  stata: ['.do'],
  stylus: ['.styl'],
  svelte: ['.svelte'],
  swift: ['.swift'],
  'system-verilog': ['.sv', '.svh'],
  systemd: ['.service', '.socket', '.timer'],
  talonscript: ['.talon'],
  tasl: ['.tasl'],
  tcl: ['.tcl'],
  templ: ['.tpl'],
  terraform: ['.tf'],
  tex: ['.tex'],
  toml: ['.toml'],
  'ts-tags': ['.tag'],
  tsv: ['.tsv'],
  tsx: ['.tsx'],
  turtle: ['.ttl'],
  twig: ['.twig'],
  typescript: ['.ts'],
  typespec: ['.tsp', '.typespec'],
  typst: ['.typ', '.typst'],
  v: ['.v'],
  vala: ['.vala'],
  vb: ['.vb'],
  verilog: ['.v'],
  vhdl: ['.vhd', '.vhdl'],
  viml: ['.vim'],
  vue: ['.vue'],
  'vue-html': ['.vue.html'],
  'vue-vine': ['.vine'],
  vyper: ['.vy'],
  wasm: ['.wat', '.wasm'],
  wenyan: ['.wy'],
  wgsl: ['.wgsl'],
  wikitext: ['.wiki'],
  wit: ['.wit'],
  wolfram: ['.wl', '.nb'],
  xml: ['.xml'],
  xsl: ['.xsl', '.xslt'],
  yaml: ['.yaml', '.yml'],
  zenscript: ['.zs'],
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
