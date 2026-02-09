# Restormel CLI — Repository setup

Use these settings after creating the GitHub repo to keep the project secure and maintainable.

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

## Quick checklist

- [ ] Repo is **Public**
- [ ] Branch protection rule for **main** (PR required; no force push / no delete)
- [ ] **Dependabot alerts** and **Dependabot security updates** enabled
- [ ] **Issues** enabled; description and topics set
- [ ] (Optional) SECURITY.md added
