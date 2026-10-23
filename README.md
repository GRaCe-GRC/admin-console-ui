# admin-console-ui

Shared Angular admin console for all GRaCe-GRC projects: review, configuration and dashboards.

> **Status:** authorities dashboard at `/authorities`: the list of regulatory authorities and a
> form to create one.

## Stack
- Angular (latest stable at setup), TypeScript
- Node.js LTS, npm

## Getting started
The dashboard calls the [admin console service](https://github.com/GRaCe-GRC/admin-console-service).
`ng serve` proxies `/api` to it on `http://localhost:8082` (`proxy.conf.json`); start it first (see
its README).

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

## Authorities dashboard
`/authorities` (the home page redirects there):

- A table of authorities: name, jurisdiction, enabled, created at (UTC), created by
- A form to create one (name and jurisdiction, both required, at most 255 characters). Field errors
  from the server (`400`) are shown next to the fields; a duplicate name (`409`) shows the server's
  message. The list reloads after a successful create.

## Project structure
Code is grouped by feature. Each component has its own folder with `.ts`, `.html`, `.scss` and
`.spec.ts`. Features are lazy-loaded from `app.routes.ts`.

```
src/
├── styles.scss                   theme tokens (light and dark), base styles, buttons, dialogs
├── testing/dialog.ts             test-only polyfill for <dialog> (jsdom has no showModal)
└── app/
    ├── app.*                     shell: header, router outlet, notifications; providers, routes
    ├── core/
    │   ├── auth/current-user.ts          the signed-in user (hard-coded: Compliance Expert)
    │   ├── http/problem-detail.ts        problem details: type and helpers to read detail and field errors
    │   ├── layout/app-header/            header band: logo, product name, user
    │   ├── layout/logo-mark/             the three-node logo as inline SVG
    │   └── notifications/                Notifications service and the toast that shows it
    └── features/
        └── authorities/
            ├── authorities.routes.ts           feature routes (lazy-loaded at /authorities)
            ├── models/authority.ts             Authority, CreateAuthorityRequest
            ├── data-access/authority-api.ts    GET and POST /api/dashboard/authorities
            ├── pages/authorities-dashboard/    page: counts, + button, create dialog, server errors
            └── components/
                ├── authority-table/            presentational: the table
                └── authority-form/             presentational: the create form and its validation
```

Colours, fonts and shadows are CSS custom properties in `styles.scss`, with dark values under
`prefers-color-scheme: dark` (or `data-theme="dark"` on the root element). Components only use the
tokens. Fonts are Plus Jakarta Sans and JetBrains Mono from Google Fonts, with system fallbacks.

| Folder | Contains |
|---|---|
| `core/` | Code used by the whole app |
| `features/<feature>/models` | Types |
| `features/<feature>/data-access` | HTTP services |
| `features/<feature>/pages` | Routed components that use services |
| `features/<feature>/components` | Presentational components: inputs and outputs only |

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
