import { isSanityConfigured } from "@/sanity/env";
import { Studio } from "./Studio";

export const dynamic = "force-static";
import { metadata as studioMetadata } from "next-sanity/studio";
export { viewport } from "next-sanity/studio";

export const metadata = { ...studioMetadata, title: { absolute: "Fruiticana CMS" } };

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <main className="grid min-h-screen place-items-center bg-forest p-8 text-cream">
        <div className="max-w-xl">
          <p className="text-xs font-semibold tracking-[0.2em] text-turmeric uppercase">Fruiticana CMS</p>
          <h1 className="mt-4 font-display text-5xl">Connect Sanity to start editing.</h1>
          <ol className="mt-6 list-decimal space-y-2 pl-5 text-cream/80">
            <li>Create a project at sanity.io/manage (free tier is fine).</li>
            <li>Add <code className="rounded bg-cream/10 px-1.5">NEXT_PUBLIC_SANITY_PROJECT_ID</code> and <code className="rounded bg-cream/10 px-1.5">NEXT_PUBLIC_SANITY_DATASET</code> to <code className="rounded bg-cream/10 px-1.5">.env.local</code>.</li>
            <li>Run <code className="rounded bg-cream/10 px-1.5">npm run seed</code> to import every page, store, flyer and image from the current site.</li>
          </ol>
          <p className="mt-6 text-sm text-cream/60">Until then the website runs on the bundled seed content, so nothing is ever blank.</p>
        </div>
      </main>
    );
  }
  return <Studio />;
}
