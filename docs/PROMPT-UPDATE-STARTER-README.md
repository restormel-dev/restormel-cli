# Prompt: Update restormel-starter README for npm CLI

Use this prompt when updating the **restormel-starter** repository so its README tells users to run the published CLI via npm.

---

## Copy-paste prompt (for restormel-starter repo)

```
Update this README so that the primary way to create a new Restormel project is via the published npm CLI.

1. **Quick start / Getting started**
   - Lead with: users need Node.js 18+, then run `npx restormel` from a blank folder to scaffold a new Restormel Next.js project in that folder.
   - No need to clone this starter repo or run create-next-app manually for the common case.

2. **Optional / Advanced**
   - Keep or add a short note that this repo is the template used by the CLI. Advanced users can still use create-next-app directly, e.g. `npx create-next-app@latest -e https://github.com/restormel-dev/restormel-starter/ .` (with appropriate flags like --yes if needed).

3. **Cross-links**
   - Link to the Restormel CLI on npm (https://www.npmjs.com/package/restormel) and/or the CLI repo (https://github.com/restormel-dev/restormel-cli) in the intro or "See also".
   - Mention that the CLI is the recommended way to start a new project or inject Restormel into an existing one.

4. **Tone**
   - Keep the README focused on what this starter provides (secure Next.js app, Vitest, ESLint, pre-commit, etc.) and that the easiest way to get it is `npx restormel`. Do not remove existing sections about tests, linting, or project structure unless they’re redundant.
```

---

## Notes

- Use this in the **restormel-starter** repo (not restormel-cli).
- After applying changes, ensure the starter README still describes the project (Vitest, ESLint, security defaults, etc.) and that "run `npx restormel`" is the first thing users see for creating a new project.
