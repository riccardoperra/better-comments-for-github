// @refresh reload
import { StartServer, createHandler } from '@solidjs/start/server'

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <title>Better Comments for GitHub</title>
          <meta charset="utf-8" />
          <meta
            name="google-site-verification"
            content="gz_CyWQlVKZRuCX5ilA0-AjrAXnwqv_nvfAOazVwVYU"
          />
          <meta
            name="description"
            content={
              'The extension that replaces the GitHub native comment box to a new block-based editor and a seamless real-time preview experience.'
            }
          />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="black-translucent"
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/96.png" />
          {assets}
        </head>
        <body>
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
))
