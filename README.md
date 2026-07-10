# Payload / JustWats

Source for [blog.justwats.com](https://blog.justwats.com), Justin Watson's
personal cybersecurity research archive.

The site covers malware analysis, threat hunting, digital forensics, incident
response, and the supporting systems used to turn evidence into decisions.

## Source and deployment model

- GitHub `main` is the canonical source branch.
- Changes are made on topic branches and reviewed through pull requests.
- GitHub Actions builds, lints, and tests every pull request.
- ChatGPT Sites is the production hosting target.
- Only a commit already merged into GitHub `main` should be deployed to Sites.
- GitHub Pages is not used.

The generated `chatgpt.site` address remains a fallback. The public hostname is
attached to the same Site through DNS managed at Porkbun.

## Preserved routes

These paths are intentionally stable and must not be removed without redirects:

- `/cobaltstrike-guide.html`
- `/sliver-implants.html`
- `/reverse-engineering-emotet.html`

## Local validation

Requires Node.js 22 or newer.

```bash
npm ci
npm run lint
npm test
```

`npm test` performs the production build, validates the deployable artifact,
and runs the rendered-output tests.

## Repository layout

- `app/` contains the index, article routes, shared components, and visual system.
- `public/` contains local static assets.
- `scripts/` contains deterministic install, build, and artifact-validation helpers.
- `tests/` contains rendered-output checks.
- `.openai/hosting.json` associates this source with its ChatGPT Site.

## Release procedure

1. Create a topic branch from the latest `main`.
2. Implement the change and run the validation commands.
3. Open a pull request and wait for the checks to pass.
4. Merge the pull request.
5. Sync the merged GitHub revision into ChatGPT Sites.
6. Create and verify a new Sites production deployment.

This ordering keeps GitHub as the auditable source of truth and Sites as the
deployment record.
