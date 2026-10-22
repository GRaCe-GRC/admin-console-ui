# admin-console-ui

Shared Angular admin console for all GRaCe-GRC projects: review, configuration and dashboards.

> **Status:** starter app. It renders a single page with the heading "Admin Console UI". Features arrive in later stories.

## Stack
- Angular (latest stable at setup), TypeScript
- Node.js LTS, npm

## Getting started
```bash
npm ci
npm start          # ng serve → http://localhost:4200
```

## Lint, test and build
```bash
npm run lint
npm test -- --watch=false
npm run build
```

CI runs the same commands on every pull request through the shared
[Angular CI workflow](https://github.com/GRaCe-GRC/.github/blob/main/.github/workflows/angular-ci.yml)
(`.github/workflows/ci.yml`).

## Architecture
This console serves all three projects. Their architecture diagrams show one admin console
per project; those are delivered as this single shared application. See the
[GRaCe-GRC documentation hub](https://github.com/GRaCe-GRC/GRaCe-GRC-docs).

## Contributing
See the organization's [contributing guide](https://github.com/GRaCe-GRC/.github/blob/main/CONTRIBUTING.md).
Commit messages use Conventional Commits with the ticket ID, for example
`feat: GRC-12: add review queue page`.

## License
Licensed under the [Apache License 2.0](LICENSE).
