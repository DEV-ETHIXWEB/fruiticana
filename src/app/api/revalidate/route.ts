import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

/**
 * Sanity webhook → instant content updates.
 * Configure in sanity.io/manage: POST https://www.fruiticana.com/api/revalidate,
 * projection `{_type, "slug": slug.current}`, secret = SANITY_REVALIDATE_SECRET.
 */
export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string; slug?: string }>(req, process.env.SANITY_REVALIDATE_SECRET);
    if (!isValidSignature) return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    if (!body?._type) return NextResponse.json({ message: "Bad request" }, { status: 400 });

    const tags = [body._type === "siteSettings" ? "settings" : body._type];
    if (body._type === "page" && body.slug) tags.push(`page:${body.slug}`);
    tags.forEach((t) => revalidateTag(t, "max"));
    return NextResponse.json({ revalidated: tags, now: Date.now() });
  } catch (err) {
    console.error("[revalidate]", err);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
