import Link from "next/link";
import { AudioControls } from "./AudioControls";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="wordmark" aria-label="JustWats home">
          <span aria-hidden="true">&lt;#</span>JustWats<span aria-hidden="true">&gt;</span>
        </Link>
        <nav aria-label="Primary navigation">
          <Link href="/#featured">Featured</Link>
          <Link href="/#notes">Recent</Link>
          <Link href="/#about">About</Link>
          <Link href="/#resources">Resources</Link>
        </nav>
        <AudioControls />
      </div>
    </header>
  );
}
