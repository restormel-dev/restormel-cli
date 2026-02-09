# Restormel CLI — Repository setup

Use these settings after creating the GitHub repo to keep the project secure and maintainable.

---

## 0. First push (one-time)

Before pushing the first time: ensure `.gitignore` includes `node_modules/`, `dist/`, `.env`, `.env.*`, `*.log`, `.DS_Store`; `package.json` has `"repository"` and correct `name`/`license`; no secrets in tracked files. Then from repo root:

```bash
git init
git add .
git commit -m "Initial commit: Restormel CLI"
git remote add origin https://github.com/restormel-dev/restormel-cli.git
git branch -M main
git push -u origin main
```

Create the repo on GitHub first (public, empty, no template). Then apply the settings below.

---

## 1. Visibility

- **Repository → Settings → General**
- Under **Danger Zone** (or visibility at top): ensure **Public** is selected.
- Public is required for trust (auditable source), `npx restormel` (or `npx github:restormel-dev/restormel-cli`), and npm package linking.

---

## 2. Branch protection (main)

**Path:** Repository → **Settings** → **Code and automation** → **Branches** → **Add branch protection rule** (or edit rule for `main`).

| Setting | Recommendation | Why |
|--------|----------------|-----|
| **Branch name pattern** | `main` | Protect the default branch. |
| **Require a pull request before merging** | ✅ On | No direct pushes to `main`; changes go through PRs. |
| **Required approvals** | 0 or 1 | 1 approval adds a second pair of eyes; 0 is fine for solo maintainers. |
| **Require status checks to pass** | ✅ On (when CI exists) | Add a status check (e.g. `build` or `test`) so only green builds merge. Leave off until you add a workflow. |
| **Require branches to be up to date** | Optional | Reduces merge skew; can make PRs noisier. |
| **Do not allow bypassing the above** | ✅ On | Applies rules to everyone, including admins. |
| **Restrict who can push to matching branches** | Off (default) | Unless you use CODEOWNERS / teams. |
| **Allow force pushes** | ❌ Disabled | Prevents rewriting history on `main`. |
| **Allow deletions** | ❌ Disabled | Prevents deleting `main`. |

Save the rule.

---

## 3. Security & maintenance

**Path:** Repository → **Settings** → **Code security and analysis** (or **Security**).

| Feature | Recommendation |
|--------|----------------|
| **Dependency graph** | ✅ Enabled (default for public repos). |
| **Dependabot alerts** | ✅ Enabled. Surfaces known vulnerabilities in dependencies. |
| **Dependabot security updates** | ✅ Enabled. Opens PRs to bump vulnerable deps. |
| **Code scanning** (e.g. CodeQL) | Optional. Add later if you want automated code security checks. |

---

## 4. General repo settings

**Path:** Repository → **Settings** → **General**.

- **Features:** Enable **Issues** (and **Projects** if you use them). Disable **Wikis** / **Discussions** unless needed.
- **Pull Requests:** Consider “Allow merge commits” or “Squash and merge” per your preference.
- **Description:** e.g. `Official CLI for Restormel — bank-grade security architecture for Next.js`.
- **Topics:** e.g. `restormel`, `nextjs`, `security`, `cli`.

---

## 5. Optional: SECURITY.md

Add a `SECURITY.md` in the repo root describing how to report vulnerabilities (e.g. open a private security advisory or email). GitHub shows a link to it in the **Security** tab and improves trust.

---

## 6. Discoverability

**About → Description & topics:** Set description (e.g. "Official CLI for Restormel — bank-grade security for Next.js") and topics: `restormel`, `nextjs`, `security`, `cli`, `create-next-app`. README first line should include "Restormel" and "Next.js". Cross-link to restormel-starter in See also. npm uses this repo’s README on the package page.

---

## Quick checklist

- [ ] First push done (or N/A)
- [ ] Repo is **Public**
- [ ] Branch protection rule for **main** (PR required; no force push / no delete)
- [ ] **Dependabot alerts** and **Dependabot security updates** enabled
- [ ] **Issues** enabled; description and topics set
- [ ] (Optional) SECURITY.md added
