import type { ReactNode } from "react";
import Link from "next/link";

type ArticleLayoutProps = {
  index: string;
  category: string;
  title: string;
  dek: string;
  revised: string;
  readTime: string;
  contents: { href: string; label: string }[];
  children: ReactNode;
  references: { href: string; label: string; detail: string }[];
};

export function ArticleLayout({
  index,
  category,
  title,
  dek,
  revised,
  readTime,
  contents,
  children,
  references,
}: ArticleLayoutProps) {
  return (
    <main className="article-main">
      <article>
        <Link href="/" className="back-link">← Index</Link>
        <header className="article-heading">
          <p className="kicker">Field note {index} / {category}</p>
          <h1>{title}</h1>
          <p className="article-dek">{dek}</p>
          <dl className="article-meta">
            <div><dt>Revised</dt><dd>{revised}</dd></div>
            <div><dt>Reading time</dt><dd>{readTime}</dd></div>
            <div><dt>Author</dt><dd>Justin Watson</dd></div>
          </dl>
        </header>

        <nav className="article-toc" aria-label="On this page">
          <p>On this page</p>
          <ol>
            {contents.map((item) => (
              <li key={item.href}><a href={item.href}>{item.label}</a></li>
            ))}
          </ol>
        </nav>

        <div className="article-body">{children}</div>

        <section className="references" aria-labelledby="references-title">
          <h2 id="references-title">References</h2>
          <ol>
            {references.map((reference) => (
              <li key={reference.href}>
                <a href={reference.href} target="_blank" rel="noreferrer">{reference.label}</a>
                <span>{reference.detail}</span>
              </li>
            ))}
          </ol>
        </section>
      </article>
    </main>
  );
}

export function Figure({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return (
    <figure className="article-figure">
      <img src={src} alt={alt} />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return <aside className="field-note">{children}</aside>;
}
