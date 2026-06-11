import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { AppProvider } from '@/lib/context/AppContext';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Nzila Academy | Portal Educacional Quântico',
  description: 'Nzila Academy - O portal educacional do futuro de alta tecnologia, com foco em desenvolvimento avançado e arquiteturas quânticas de software.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${spaceGrotesk.variable} dark`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if (typeof window !== 'undefined') {
                    var currentFetch = window.fetch;
                    Object.defineProperty(window, 'fetch', {
                      get: function() {
                        return currentFetch;
                      },
                      set: function(val) {
                        currentFetch = val;
                      },
                      configurable: true,
                      enumerable: true
                    });
                  }
                } catch (e) {
                  console.warn('Fetch polyfill patch failed:', e);
                }
              })();
            `
          }}
        />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tw-animate-css@1.4.0/tw-animate.min.css" />
      </head>
      <body className="bg-[#0b0813] text-gray-100 font-sans antialiased min-h-screen selection:bg-purple-500/30 selection:text-purple-200" suppressHydrationWarning>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
