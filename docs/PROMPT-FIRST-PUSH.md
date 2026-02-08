# Prompt: First push to restormel-cli repo

Copy the block below and paste it into your CLI agent (e.g. Cursor agent) so it can prepare and verify everything for the first push to GitHub.

---

```
This repo is restormel-cli (official CLI for Restormel). I need everything in place for the **first push** to the public GitHub repo https://github.com/restormel-dev/restormel-cli.

Please do the following:

1. **Ensure .gitignore exists** and includes: node_modules/, dist/, .env, .env.*, *.log, .DS_Store. Nothing that could contain secrets or build artifacts should be committed.

2. **Ensure package.json** has the correct "repository" field pointing to https://github.com/restormel-dev/restormel-cli.git (and that "name" is "restormel", "license" is "MIT").

3. **Verify no secrets or sensitive data** are in any file that would be committed (no API keys, tokens, or local paths that shouldn’t be public).

4. **Provide the exact git commands** I should run from the repo root to perform the first push. Assume:
   - The repo may not be a git repo yet (git init if needed).
   - Remote should be: https://github.com/restormel-dev/restormel-cli.git
   - Branch should be: main
   - Include: init (if needed), add ., commit with a clear message, remote add origin, branch -M main, push -u origin main.

5. **Optional:** Add a short "First push" section to the README or a docs file that points to docs/REPO-SETUP.md for branch protection and visibility settings after the repo exists.

6. **Output a concise checklist** I can follow: e.g. ( ) Create repo on GitHub (public, no template, no README, add MIT license), ( ) Run the git commands you provided, ( ) Apply branch rules from docs/REPO-SETUP.md.
```

---

After the agent responds, run the git commands it gives you from the repo root, then configure branch protection and security settings using `docs/REPO-SETUP.md`.
