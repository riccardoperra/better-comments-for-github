import { Title } from '@solidjs/meta'
import logo from '../../../brand/logo.png'

function GitHubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props} fill={'currentColor'}>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

function ChromeIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 48 48"
      height="48"
      width="48"
      {...props}
    >
      <defs>
        <linearGradient
          id="a"
          x1="3.2173"
          y1="15"
          x2="44.7812"
          y2="15"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stop-color="#d93025" />
          <stop offset="1" stop-color="#ea4335" />
        </linearGradient>
        <linearGradient
          id="b"
          x1="20.7219"
          y1="47.6791"
          x2="41.5039"
          y2="11.6837"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stop-color="#fcc934" />
          <stop offset="1" stop-color="#fbbc04" />
        </linearGradient>
        <linearGradient
          id="c"
          x1="26.5981"
          y1="46.5015"
          x2="5.8161"
          y2="10.506"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stop-color="#1e8e3e" />
          <stop offset="1" stop-color="#34a853" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="23.9947" r="12" style="fill:#fff" />
      <path
        d="M3.2154,36A24,24,0,1,0,12,3.2154,24,24,0,0,0,3.2154,36ZM34.3923,18A12,12,0,1,1,18,13.6077,12,12,0,0,1,34.3923,18Z"
        style="fill:none"
      />
      <path
        d="M24,12H44.7812a23.9939,23.9939,0,0,0-41.5639.0029L13.6079,30l.0093-.0024A11.9852,11.9852,0,0,1,24,12Z"
        style="fill:url(#a)"
      />
      <circle cx="24" cy="24" r="9.5" style="fill:#1a73e8" />
      <path
        d="M34.3913,30.0029,24.0007,48A23.994,23.994,0,0,0,44.78,12.0031H23.9989l-.0025.0093A11.985,11.985,0,0,1,34.3913,30.0029Z"
        style="fill:url(#b)"
      />
      <path
        d="M13.6086,30.0031,3.218,12.006A23.994,23.994,0,0,0,24.0025,48L34.3931,30.0029l-.0067-.0068a11.9852,11.9852,0,0,1-20.7778.007Z"
        style="fill:url(#c)"
      />
    </svg>
  )
}

export default function Home() {
  return (
    <main class={'main'}>
      <Title>Better Comments for GitHub</Title>
      <div class={'hero'}>
        <div class={'title'}>
          <img alt={'logo'} src={logo} width={180} />
          <h1>Better Comments for GitHub</h1>
        </div>

        <p class={'description'}>
          “Ever spent too much time writing a decent review, issue comment, or
          discussion? What if the GitHub comment box could work better? 👀”
        </p>

        <div class={'cta-list'}>
          <a
            href={
              'https://chromewebstore.google.com/detail/better-comments-for-githu/hkpjbleacapfcfeneimhmcipjkfbgdpg'
            }
            target={'_blank'}
            class={'cta chrome-web-store-button'}
          >
            <ChromeIcon width={24} />
            Get on Chrome Web Store
          </a>

          <a
            href={'https://github.com/riccardoperra/better-comments-for-github'}
            class={'cta github-button'}
            target={'blank'}
          >
            <GitHubIcon width={24} />
            GitHub
          </a>
        </div>
      </div>
      {/* <div class={'editor-try'}>*/}
      {/*  <h2>TRY NOW!</h2>*/}
      {/*  <div class={'editor'}>*/}
      {/*    <Editor />*/}
      {/*  </div>*/}
      {/* </div>*/}

      {/* <iframe*/}
      {/*  ref={(iframe) => {*/}
      {/*    import('comlink').then((Comlink) => {*/}
      {/*      iframe.contentDocument!.addEventListener(*/}
      {/*        'message',*/}
      {/*        (message) => {*/}
      {/*          const url = message.data*/}
      {/*          const worker = new Worker(url)*/}
      {/*          console.debug(*/}
      {/*            '[GitHub Better Comments Extension] Init worker',*/}
      {/*            worker,*/}
      {/*          )*/}
      {/*          const wrappedWorker = Comlink.wrap(worker)*/}
      {/*          Comlink.expose(*/}
      {/*            wrappedWorker,*/}
      {/*            Comlink.windowEndpoint(self.parent),*/}
      {/*          )*/}
      {/*        },*/}
      {/*        { once: true },*/}
      {/*      )*/}
      {/*    })*/}
      {/*  }}*/}
      {/*  id={'codemirror-ata'}*/}
      {/*  style={{ display: 'none' }}*/}
      {/* ></iframe>*/}
    </main>
  )
}
