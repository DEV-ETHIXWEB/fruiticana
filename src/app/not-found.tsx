import type { Metadata } from "next";
import SiteLayout from "./(site)/layout";
import NotFound from "./(site)/not-found";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

/** Unmatched URLs (including retired legacy paths) still get the full branded shell. */
export default function RootNotFound() {
  return (
    <SiteLayout>
      <NotFound />
    </SiteLayout>
  );
}
