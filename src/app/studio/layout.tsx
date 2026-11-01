import { fontVariables } from "../fonts";
import "../globals.css";

/** The CMS has its own root layout: it sits outside the language routing. */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
