# admin-console-ui

Shared Angular admin console for all GRaCe-GRC projects: review, configuration and dashboards.

> **Status:** authorities dashboard at `/authorities` (create and delete authorities) and an
> authority page at `/authorities/<id>` (its frameworks, with coverage; create and delete
> frameworks), loaded from `GET /api/dashboard`.

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

- A table of authorities: name, jurisdiction, number of frameworks, enabled, created at (UTC),
  created by
- A form to create one (name and jurisdiction, both required, at most 255 characters). Field errors
  from the server (`400`) are shown next to the fields; a duplicate name (`409`) shows the server's
  message.
- A delete confirmation. An authority that still has frameworks cannot be deleted: the dialog says
  so instead of offering Delete, and a `409` from the server shows its message.

Each authority's name links to its page.

## Authority page
`/authorities/<id>`:

- Breadcrumb Regulatory data › Authorities › the authority, and a summary: jurisdiction, status,
  created (date and by whom) and the number of frameworks
- A table of its frameworks: name and citation, short name, number of files, coverage (a bar,
  the percentage and `mapped/total` lowest-level provisions with at least one mapped control),
  status and created date
- A form to create a framework (name required; short name and citation optional; at most 255
  characters each) → `POST /api/dashboard/frameworks` with the authority's id. Field errors (`400`)
  are shown next to the fields, a duplicate name (`409`) shows the server's message
- A delete confirmation (`DELETE /api/dashboard/frameworks/{id}`). A framework that still has files
  cannot be deleted: the dialog says so instead of offering Delete, and a `409` from the server
  shows its message
- An unknown id shows "Authority not found" with a link back to the authorities

The data comes from one call, `GET /api/dashboard`, which returns the whole tree (authorities,
frameworks, files, requirements, coverage, mappings and the control library). `DashboardStore`
loads it once and every page reads it from there; after each create or delete the page calls
`reload()`. Writes go to their own endpoints (`POST`/`DELETE /api/dashboard/authorities` and
`/api/dashboard/frameworks`).

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
    │   ├── dashboard/dashboard.ts        the GET /api/dashboard response types, shared by every feature
    │   ├── dashboard/dashboard-api.ts    GET /api/dashboard
    │   ├── dashboard/dashboard-store.ts  the loaded dashboard as signals, load() once and reload() after writes
    │   ├── http/problem-detail.ts        problem details: type and helpers to read detail and field errors
    │   ├── layout/app-header/            header band: logo, product name, user
    │   ├── layout/logo-mark/             the three-node logo as inline SVG
    │   └── notifications/                Notifications service and the toast that shows it
    └── features/
        └── authorities/
            ├── authorities.routes.ts           feature routes (lazy-loaded at /authorities): '' and ':id'
            ├── models/                         CreateAuthorityRequest, CreateFrameworkRequest
            ├── data-access/authority-api.ts    POST and DELETE /api/dashboard/authorities
            ├── data-access/framework-api.ts    POST and DELETE /api/dashboard/frameworks
            ├── pages/authorities-dashboard/    page: counts, + button, create and delete dialogs, server errors
            ├── pages/authority-page/           page: breadcrumb, summary, frameworks, create and delete dialogs
            └── components/
                ├── authority-table/            presentational: the table, a link and a delete action per row
                ├── authority-delete-dialog/    presentational: the delete confirmation
                ├── authority-form/             presentational: the create form and its validation
                ├── framework-table/            presentational: the frameworks of an authority
                ├── framework-delete-dialog/    presentational: the delete confirmation
                ├── framework-form/             presentational: the create form and its validation
                └── coverage-bar/               presentational: coverage as a bar, a percentage and mapped/total
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
