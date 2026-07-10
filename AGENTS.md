# Repository operating rules

## Change control

- Treat GitHub `main` as the canonical source.
- Do not commit product changes directly to `main`.
- Use a topic branch and pull request for every source or content change.
- Do not deploy a Sites version that is not represented by a merged GitHub commit.
- Record the merged GitHub commit in the Sites checkpoint or release message.

## Required validation

Before requesting review or deployment, run:

```bash
npm run lint
npm test
```

Both commands must pass. Do not bypass source failures with a remote-only build.

## Product constraints

- Preserve the personal cyber-research archive identity. Do not introduce B2B
  SaaS landing-page patterns, sales copy, conversion metrics, pricing, or generic
  product-marketing sections.
- Preserve the raven entrance, atmospheric network field, optional audio controls,
  compact media-first index, resources, biography, and external links.
- Preserve the legacy `.html` article routes unless redirects are added in the
  same pull request.
- Keep technical claims evidence-led. Distinguish observations, derived results,
  inferences, and unverified gaps.
- Defang historical malicious infrastructure shown in article prose or code.

## Hosting

- ChatGPT Sites is the production host.
- GitHub Pages must remain disabled.
- Do not change `.openai/hosting.json` project identity or custom-domain settings
  without explicit owner approval.
