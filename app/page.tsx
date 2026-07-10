import Link from "next/link";
import { IntroGate } from "./components/IntroGate";

const posts = [
  {
    href: "/sliver-implants.html",
    image: "https://i.imgur.com/YArI8k0.png",
    alt: "Abstract Sliver emblem",
    eyebrow: "C2 analysis / field note 02",
    title: "Hunting Sliver without betting on defaults",
    summary:
      "A defender-first workflow for combining endpoint, DNS, HTTP, and memory evidence when Sliver is suspected.",
  },
  {
    href: "/reverse-engineering-emotet.html",
    image: "https://i.imgur.com/cDOkNmL.png",
    alt: "Abstract teal digital structure",
    eyebrow: "PowerShell / field note 03",
    title: "Unpacking an obfuscated Emotet PowerShell loader",
    summary:
      "A sample-led walk through format-string obfuscation, dynamic invocation, Base64 decoding, raw DEFLATE, and the recovered downloader.",
  },
];

export default function Home() {
  return (
    <>
      <IntroGate />
      <main className="site-main home-main" id="top">
        <h1 className="sr-only">Payload: cybersecurity field notes by Justin Watson</h1>

        <section id="featured" aria-labelledby="featured-title">
          <div className="section-line">
            <h2 id="featured-title">Featured</h2>
            <span>01</span>
          </div>
          <article className="feature-entry">
            <Link href="/cobaltstrike-guide.html" className="entry-image feature-image">
              <img
                src="https://i.imgur.com/P0Hyprs.png"
                alt="Abstract command-and-control infrastructure visualization"
              />
            </Link>
            <div className="entry-copy">
              <p className="entry-meta">C2 analysis / field note 01</p>
              <h3>
                <Link href="/cobaltstrike-guide.html">
                  Detecting Cobalt Strike Beacon beyond the obvious indicators
                </Link>
              </h3>
              <p>
                A practical method for moving from a suspicious payload or
                connection to a defensible Beacon assessment using configuration,
                transport, process, and memory evidence.
              </p>
              <Link href="/cobaltstrike-guide.html" className="text-link">
                Read note <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </article>
        </section>

        <section id="notes" aria-labelledby="notes-title">
          <div className="section-line">
            <h2 id="notes-title">Recent</h2>
            <span>02–03</span>
          </div>
          <div className="recent-grid">
            {posts.map((post) => (
              <article className="recent-entry" key={post.href}>
                <Link href={post.href} className="entry-image recent-image">
                  <img src={post.image} alt={post.alt} />
                </Link>
                <div className="entry-copy">
                  <p className="entry-meta">{post.eyebrow}</p>
                  <h3>
                    <Link href={post.href}>{post.title}</Link>
                  </h3>
                  <p>{post.summary}</p>
                  <Link href={post.href} className="text-link">
                    Read note <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="lower-grid">
          <section id="about" aria-labelledby="about-title">
            <div className="section-line">
              <h2 id="about-title">About</h2>
            </div>
            <p>
              I’m Justin Watson. My work sits across defensive cyber operations,
              threat analysis, incident response, and the systems used to turn
              evidence into decisions. This site is where I document methods,
              failed assumptions, useful tools, and findings worth carrying into
              the next investigation.
            </p>
          </section>

          <section id="resources" aria-labelledby="resources-title">
            <div className="section-line">
              <h2 id="resources-title">Resources</h2>
            </div>
            <ul className="resource-list">
              <li>
                <a href="https://jaiminton.com" target="_blank" rel="noreferrer">
                  Root Cause Analysis
                </a>
                <span>DFIR, malware analysis, and technical references</span>
              </li>
              <li>
                <a href="https://vx-underground.org" target="_blank" rel="noreferrer">
                  vx-underground
                </a>
                <span>Malware samples, papers, and historical research</span>
              </li>
              <li>
                <a href="https://viz.greynoise.io" target="_blank" rel="noreferrer">
                  GreyNoise Visualizer
                </a>
                <span>Internet scanning and noise context</span>
              </li>
            </ul>
          </section>
        </section>

        <footer className="site-footer">
          <p>Justin Watson / Payload</p>
          <nav aria-label="External links">
            <a href="https://github.com/JustWats" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://bsky.app/profile/justwats.com" target="_blank" rel="noreferrer">Bluesky</a>
            <a href="https://www.linkedin.com/in/justwats" target="_blank" rel="noreferrer">LinkedIn</a>
            <a href="mailto:mail@justwats.com">Email</a>
          </nav>
        </footer>
      </main>
    </>
  );
}
