import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { getQueryClient } from '../lib/query-client'
import { ToastProvider } from '../components/Toast'
import { PrivacyLockProvider } from '../components/PrivacyLock'
import Footer from '../components/Footer'
import Header from '../components/Header'
import MobileNav from '../components/MobileNav'

import appCss from '../styles.css?url'

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'AEROLOG A320 — Airbus Maintenance & Troubleshooting Logbook',
      },
      {
        name: 'description',
        content: 'Personal technical logbook for recording, searching, and managing Airbus A320 troubleshooting history and defect evidence.',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600;700&display=swap',
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="min-h-screen flex flex-col font-sans antialiased text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-950">
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <PrivacyLockProvider>
              <Header />
              <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
                {children}
              </main>
              <Footer />
              <MobileNav />
            </PrivacyLockProvider>
          </ToastProvider>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}
