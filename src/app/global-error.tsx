"use client";

import { useEffect } from "react";
import { fontVariables } from "./fonts";
import "./globals.css";

/**
 * Last-resort screen when the root layout itself fails. The page language isn't known here,
 * so it speaks both, and it links home with a plain anchor (no app context to rely on).
 */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <html lang="en-CA" className={fontVariables}>
      <body>
        <main className="container-x grid min-h-screen place-items-center py-16 text-center">
          <div>
            <h1 className="font-display text-title text-forest">Something went wrong on our side.</h1>
            <p lang="pa" className="mt-2 font-display text-xl text-forest/80">
              ਸਾਡੇ ਪਾਸੇ ਕੋਈ ਗੜਬੜ ਹੋ ਗਈ।
            </p>
            <p className="mx-auto mt-5 max-w-md text-ink-soft">Please try again, or call our head office at 604-502-0005.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={() => retry()} className="btn-3d btn-chili rounded-full bg-chili px-6 py-3.5 text-[0.95rem] font-semibold text-white">
                Try again · ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ
              </button>
              {/* a full page load on purpose: the app around this screen has failed */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/" className="btn-glass rounded-full px-6 py-3.5 text-[0.95rem] font-semibold text-forest">
                Home · ਮੁੱਖ ਪੰਨਾ
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
