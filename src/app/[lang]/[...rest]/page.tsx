import { notFound } from "next/navigation";

/** Any unknown path inside a language renders that language's branded 404 page. */
export default function CatchAll() {
  notFound();
}
