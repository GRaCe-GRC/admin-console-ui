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

Branch verify runs the same commands on every push to a branch and on every pull request, through the
shared [Angular CI workflow](https://github.com/GRaCe-GRC/.github/blob/main/.github/workflows/angular-ci.yml) (`.github/workflows/branch-verify.yml`).

## Versions and images
Versions follow semantic versioning and come from the commit messages. Every merge to `main`
runs `.github/workflows/release.yml`: the CI again, then the shared
[release workflow](https://github.com/GRaCe-GRC/.github/blob/main/.github/workflows/README.md#release):

| Commit | Release |
|---|---|
| `fix: GRC-<n>: ...` | Patch |
| `feat: GRC-<n>: ...` | Minor |
| `chore:`, `docs:`, ... | No release |

A release creates the `vX.Y.Z` tag, a GitHub Release with notes, and the image
`ghcr.io/grace-grc/admin-console-ui:<version>` (also tagged `latest`, for `linux/amd64` and
`linux/arm64`). The release build sets the version in `package.json` without committing it.

The image serves the built app with nginx on port 80. Requests to `/api/` go to the admin
console service; every other path returns the app, so routes work on reload.

| Environment variable | Default |
|---|---|
| `ADMIN_CONSOLE_SERVICE_URL` | `http://admin-console-service:8080` |

nginx stops at startup if that host cannot be resolved. To run the image against a service on
your machine:

```bash
docker run --rm -p 4200:80 -e ADMIN_CONSOLE_SERVICE_URL=http://host.docker.internal:8080 \
  ghcr.io/grace-grc/admin-console-ui:latest
```

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
