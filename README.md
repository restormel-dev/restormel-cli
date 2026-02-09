# Restormel CLI

**Official CLI for Restormel: bank-grade security architecture for Next.js.** One command to scaffold a new secure Next.js app or inject security rules and audit tooling into an existing project. No config.

Run `restormel` from a **blank folder** → new Restormel project. Run it from an **existing project** → inject security rules and audit tooling. New projects are scaffolded from the [Restormel starter template](https://github.com/restormel-dev/restormel-starter).

---

## Quick start

You need **Node.js 18+**. No install required.

- **New project:** Open a **blank folder**, then run:
  ```bash
  npx restormel
  ```
  The CLI scaffolds the Restormel Next.js app **in that folder** (no extra subfolder).
- **Existing project:** In a folder that **has a `package.json`**, run the same command. Confirm to add `.cursorrules`, the audit script, and optionally security deps.

One command; the CLI detects the context.

---

## Using it

- **New project:** Open a **blank folder** (or one with no `package.json`). Run `npx restormel`. The CLI scaffolds the Restormel Next.js app **in that folder** (no extra subfolder).
- **Existing project:** Open a folder that **has a `package.json`**. Run `npx restormel`. Confirm to add `.cursorrules`, the audit script, and optionally security deps.

To pin a specific version: `npx restormel@1.0.0`. To use the latest: `npx restormel@latest`.

---

## Alternative: run from source

If you're contributing to the CLI or prefer not to use npm, clone and build locally:

```bash
git clone https://github.com/restormel-dev/restormel-cli.git
cd restormel-cli
npm run setup
```

From a **blank folder** (new project) or a folder **with a `package.json`** (existing project), run the CLI by path:

```bash
npx /path/to/restormel-cli
```

Replace `/path/to/restormel-cli` with your actual path (e.g. `~/projects/restormel-cli`).

---

## Updates

- **CLI:** When a newer version of the CLI is available, the CLI shows a one-line message at the end of the run with the command to update (e.g. `npx restormel@latest`). The check is non-blocking and does not fail if offline.
- **Injected content (.cursorrules, audit script):** Re-run the CLI in your project and choose **Yes** to "Inject Restormel…". The CLI fetches the latest `.cursorrules` from the starter and overwrites your local copy and `scripts/audit.ts`. If your local `.cursorrules` is older than the remote, the prompt will say "(A newer .cursorrules is available.)" so you know to update. **Note:** Re-injecting overwrites any local edits to those files.

---

## Optional: global `restormel` command

If you want to type `restormel` from any folder (without `npx`), run `npm run link` from inside restormel-cli. If you get **EACCES / permission denied**, npm is trying to write to a system directory. Fix it once by using a directory you own:

```bash
mkdir -p ~/.npm-global
npm config set prefix ~/.npm-global
```

Add this to your shell config (e.g. `~/.zshrc`): `export PATH="$HOME/.npm-global/bin:$PATH"`, then open a new terminal. After that, from restormel-cli run `npm run link` again — no sudo needed.

---

## Troubleshooting

- **`restormel: command not found`** — Run `npx restormel` (npx will download and run the CLI). Or install globally: `npm install -g restormel`, or use the path-based method (see "Alternative: run from source" above).
- **"Found invalid GitHub URL" or "Could not locate the repository"** — create-next-app only works with a **public** GitHub repo. Ensure [restormel-starter](https://github.com/restormel-dev/restormel-starter) exists, is public, and that its git `origin` is set (e.g. in that repo: `git remote set-url origin https://github.com/restormel-dev/restormel-starter.git`). If the repo is private or missing, the CLI will show this error.

---

## Repo setup (maintainers)

**First push:** Create the repo on GitHub (public, no template, no README, add MIT license). From the repo root, run:

```bash
git init
git add .
git commit -m "Initial commit: Restormel CLI"
git remote add origin https://github.com/restormel-dev/restormel-cli.git
git branch -M main
git push -u origin main
```

Then apply branch protection and security settings from [docs/REPO-SETUP.md](docs/REPO-SETUP.md).

After the repo exists, see [docs/REPO-SETUP.md](docs/REPO-SETUP.md) for branch protection, visibility, and Dependabot. The prompt in [docs/PROMPT-FIRST-PUSH.md](docs/PROMPT-FIRST-PUSH.md) can be used to re-verify files and commands.

---

## Publishing to npm (maintainers)

The package is published as [restormel](https://www.npmjs.com/package/restormel). To publish a new version:

```bash
cd restormel-cli
npm version patch   # or minor / major
npm publish
```

---

## What it does

- **Greenfield:** Runs `create-next-app` with the Restormel starter template in the **current directory** (`.`), so the folder you're in becomes the project. No subfolder. Source: [restormel-dev/restormel-starter](https://github.com/restormel-dev/restormel-starter) (canonical repo; app and `.cursorrules` at repo root).
- **Brownfield:** Fetches `.cursorrules` from the starter repo root (`https://raw.githubusercontent.com/restormel-dev/restormel-starter/main/.cursorrules`), writes it to your project, adds `scripts/audit.ts` (secrets + dangerous-pattern scan), adds `"audit": "ts-node scripts/audit.ts"` to `package.json`, and optionally installs `zod`, `server-only`, `@supabase/ssr`.

After retrofit, run `npm run audit` in that project to run the Restormel security scan (secrets and dangerous patterns).

---

## Starter template (source of truth)

The CLI uses the [restormel-starter](https://github.com/restormel-dev/restormel-starter) repo as the single source of truth. Layout: app at repo root (no subfolder); greenfield and brownfield use the same repo and root `.cursorrules`.

**In the starter (for user guidance):**

- **Tests:** Vitest 4. Run tests with `npm run test`. (Do not reference Jest.)
- **Linting:** Next 16 removed `next lint`. The starter runs ESLint directly: `npm run lint` (runs `eslint . --max-warnings 0`). Do not reference `next lint`.
- **Pre-commit:** Husky runs lint-staged (Prettier + ESLint on staged files) and then `npm run audit` (dependency audit). It does **not** run `npm run test` on commit.
- **Dependency security:** The starter uses Vitest 4 and npm `overrides` for `glob` to avoid deprecated/vulnerable deps (e.g. old glob, inflight, esbuild advisory). ESLint uses a flat config (no FlatCompat).

**Release note (starter):** *Starter template: Vitest 4 replaces Jest, lint runs via ESLint (Next 16), pre-commit runs lint + audit; app and .cursorrules remain at repo root for greenfield and brownfield.*

---

## Trust & security

**What you see when creating a new project**

- **"Downloading files from repo https://github.com/restormel-dev/restormel-starter/..."** — From `create-next-app`: it is fetching the **only** source the CLI uses (the public Restormel starter). The CLI prints the same URL before this so you can verify the source.
- **"Installing packages. This might take a couple of minutes."** — `create-next-app` running `npm install` in your new project (starter dependencies).
- **`npm warn deprecated inflight` / `glob`** — If you still see these, they come from the starter or Next.js dependency tree. The current starter uses Vitest 4 and npm `overrides` for `glob` to avoid deprecated/vulnerable deps; after pulling the latest starter you typically won't see them. If they appear, run `npm audit` and `npm update` in the starter repo.
- **`prepare` / `husky`** — The starter's `package.json` has a `prepare` script that runs [husky](https://typicode.github.io/husky/) (git hooks). Pre-commit runs lint-staged (Prettier + ESLint) and then `npm run audit`; it does not run `npm run test` on commit.

**What the CLI does**

- The CLI **only** uses this URL for new projects and for brownfield `.cursorrules`:
  **https://github.com/restormel-dev/restormel-starter**
  No other URLs, no telemetry, no extra network calls. You can inspect the repo and the CLI source to verify.

**Reducing security risk**

- **CLI:** Dependencies are minimal; run `npm audit` in the restormel-cli repo and fix any reported issues.
- **Starter:** The [restormel-starter](https://github.com/restormel-dev/restormel-starter) repo uses Vitest 4 and npm overrides for `glob` to avoid deprecated/vulnerable deps. Keep dependencies up to date and run `npm audit` there so new projects get a clean tree.

---

## See also

- **[restormel-starter](https://github.com/restormel-dev/restormel-starter)** — The Next.js template this CLI uses for greenfield projects. Secure defaults, Vitest, ESLint, pre-commit.

---

## License

MIT
