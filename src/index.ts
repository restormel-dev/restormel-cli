#!/usr/bin/env node

import { program } from "commander";
import * as p from "@clack/prompts";
import { execa } from "execa";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESTORMEL_VERSION = "1.0.0";
const BLUE = "#3b82f6";
const CURSORRULES_URL =
  "https://raw.githubusercontent.com/restormel-dev/restormel-starter/main/.cursorrules";
const STARTER_REPO_URL =
  "https://github.com/restormel-dev/restormel-starter";
const NPM_REGISTRY_URL = "https://registry.npmjs.org/restormel/latest";

function parseVersion(v: string): number[] {
  return v.replace(/^v/, "").split(".").map((n) => parseInt(n, 10) || 0);
}

function isNewerVersion(latest: string, current: string): boolean {
  const a = parseVersion(latest);
  const b = parseVersion(current);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (x > y) return true;
    if (x < y) return false;
  }
  return false;
}

/** Non-blocking check; returns message if update available, else null. */
async function checkForCliUpdate(): Promise<string | null> {
  try {
    const res = await fetch(NPM_REGISTRY_URL, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const data = (await res.json()) as { version?: string };
    const latest = data.version;
    if (!latest || !isNewerVersion(latest, RESTORMEL_VERSION)) return null;
    return chalk.gray(`  Update available: restormel ${chalk.hex(BLUE)(latest)}. Run: ${chalk.cyan("npx restormel@latest")} or ${chalk.cyan("npx github:restormel-dev/restormel-cli")}`);
  } catch {
    return null;
  }
}

function getHeader(): string {
  const line = "═".repeat(28);
  const title = chalk.hex(BLUE).bold("  RESTORMEL v" + RESTORMEL_VERSION + "  ");
  return chalk.white("\n  ┌" + line + "┐\n  │") + title + chalk.white("│\n  └" + line + "┘\n");
}

function isGreenfield(cwd: string): boolean {
  const pkgPath = path.join(cwd, "package.json");
  if (!fs.existsSync(pkgPath)) return true;
  try {
    const content = fs.readFileSync(pkgPath, "utf8").trim();
    return content.length === 0;
  } catch {
    return true;
  }
}

function getPackageManager(cwd: string): "pnpm" | "yarn" | "npm" {
  if (fs.existsSync(path.join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (fs.existsSync(path.join(cwd, "yarn.lock"))) return "yarn";
  return "npm";
}

async function runGreenfield(cwd: string): Promise<void> {
  const sourceUrl = STARTER_REPO_URL.endsWith("/") ? STARTER_REPO_URL : `${STARTER_REPO_URL}/`;
  console.log(chalk.gray(`  Source: ${chalk.hex(BLUE)("official Restormel starter")} — ${sourceUrl}`));
  console.log();
  console.log(chalk.gray("  Creating your Restormel Next.js project in this folder..."));
  console.log(chalk.gray("  (You'll see create-next-app output below. This may take a few minutes.)"));
  console.log();
  try {
    await execa("npx", [
      "create-next-app@latest",
      "--yes",
      "-e",
      sourceUrl,
      ".",
    ], { cwd, stdio: "inherit" });
    console.log();
    p.outro(chalk.hex(BLUE)("Success ") + "🏰 " + chalk.white("Your Restormel project is ready in this folder."));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(chalk.red("\nError:"), msg);
    if (msg.includes("invalid GitHub URL") || msg.includes("Could not locate the repository")) {
      console.error(chalk.yellow("\nMake sure the Restormel starter repo exists and is public:"));
      console.error(chalk.gray(`  ${STARTER_REPO_URL}`));
      console.error(chalk.gray("  If it's private or missing, create/push the repo or set it to public."));
    }
    process.exit(1);
  }
}

const AUDIT_SCRIPT_CONTENT = `import fs from "fs";
import path from "path";
import chalk from "chalk";

const SECRET_PATTERNS = [
  /(?:api[_-]?key|apikey)\\s*[:=]\\s*["'\`][^"'\`]+["'\`]/gi,
  /(?:password|passwd|pwd)\\s*[:=]\\s*["'\`][^"'\`]+["'\`]/gi,
  /(?:secret|token)\\s*[:=]\\s*["'\`][^"'\`]+["'\`]/gi,
  /[a-zA-Z0-9_-]{20,}/g,
];

const DANGEROUS_PATTERNS = [
  { pattern: /\\beval\\s*\\(/g, name: "eval()" },
  { pattern: /dangerouslySetInnerHTML/g, name: "dangerouslySetInnerHTML" },
  { pattern: /innerHTML\\s*=/g, name: "innerHTML" },
  { pattern: /document\\.write/g, name: "document.write" },
  { pattern: /new Function\\s*\\(/g, name: "new Function()" },
];

function scanFile(filePath: string): { secrets: number; dangerous: string[] } {
  const content = fs.readFileSync(filePath, "utf8");
  let secrets = 0;
  for (const re of SECRET_PATTERNS) {
    const m = content.match(re);
    if (m) secrets += m.length;
  }
  const dangerous: string[] = [];
  for (const { pattern, name } of DANGEROUS_PATTERNS) {
    if (pattern.test(content)) dangerous.push(name);
  }
  return { secrets, dangerous };
}

function walkDir(dir: string, ext: string[], ignore: Set<string>, results: string[]): void {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (ignore.has(e.name) || ignore.has(path.basename(full))) continue;
    if (e.isDirectory()) walkDir(full, ext, ignore, results);
    else if (ext.some((x) => e.name.endsWith(x))) results.push(full);
  }
}

const root = process.cwd();
const ignore = new Set(["node_modules", ".next", ".git", "dist", "build"]);
const files: string[] = [];
walkDir(root, [".ts", ".tsx", ".js", ".jsx"], ignore, files);

let totalSecrets = 0;
const allDangerous: { file: string; patterns: string[] }[] = [];

for (const file of files) {
  const rel = path.relative(root, file);
  const { secrets, dangerous } = scanFile(file);
  if (secrets > 0 || dangerous.length > 0) {
    totalSecrets += secrets;
    if (dangerous.length) allDangerous.push({ file: rel, patterns: dangerous });
  }
}

console.log(chalk.hex("#3b82f6").bold("\\nRestormel Security Audit\\n"));
if (totalSecrets > 0) {
  console.log(chalk.yellow("⚠ Potential secret(s) found: " + totalSecrets));
}
if (allDangerous.length > 0) {
  console.log(chalk.yellow("⚠ Dangerous pattern(s):"));
  for (const { file, patterns } of allDangerous) {
    console.log(chalk.gray("  " + file + ": ") + patterns.join(", "));
  }
}
if (totalSecrets === 0 && allDangerous.length === 0) {
  console.log(chalk.green("✓ No obvious secrets or dangerous patterns detected."));
}
console.log("");
`;

async function runBrownfield(cwd: string): Promise<void> {
  const spinner = p.spinner();
  spinner.start("Checking for updates...");
  let cursorrulesContent: string;
  try {
    const res = await fetch(CURSORRULES_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    cursorrulesContent = await res.text();
  } catch (err) {
    spinner.stop("Fetch failed.");
    console.error(chalk.red("Could not fetch .cursorrules:"), err instanceof Error ? err.message : err);
    process.exit(1);
  }
  spinner.stop("Fetched.");
  const cursorrulesPath = path.join(cwd, ".cursorrules");
  const hasLocalCursorrules = fs.existsSync(cursorrulesPath);
  const localCursorrules = hasLocalCursorrules ? fs.readFileSync(cursorrulesPath, "utf8") : "";
  const cursorrulesOutdated = hasLocalCursorrules && localCursorrules.trim() !== cursorrulesContent.trim();
  const injectMessage = cursorrulesOutdated
    ? "Inject Restormel Security Architecture into this project? (A newer .cursorrules is available.)"
    : "Inject Restormel Security Architecture into this project?";
  const confirmInject = await p.confirm({
    message: injectMessage,
    initialValue: true,
  });
  if (p.isCancel(confirmInject) || !confirmInject) {
    p.cancel("Injection skipped.");
    process.exit(0);
  }

  fs.writeFileSync(cursorrulesPath, cursorrulesContent, "utf8");
  p.log.success("Wrote .cursorrules");

  const scriptsDir = path.join(cwd, "scripts");
  if (!fs.existsSync(scriptsDir)) fs.mkdirSync(scriptsDir, { recursive: true });
  const auditPath = path.join(scriptsDir, "audit.ts");
  fs.writeFileSync(auditPath, AUDIT_SCRIPT_CONTENT, "utf8");
  p.log.success("Created scripts/audit.ts");

  const pkgPath = path.join(cwd, "package.json");
  let pkg: { scripts?: Record<string, string> };
  try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  } catch {
    pkg = {};
  }
  if (!pkg.scripts) pkg.scripts = {};
  if (!pkg.scripts.audit) {
    pkg.scripts.audit = "ts-node scripts/audit.ts";
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), "utf8");
    p.log.success("Added \"audit\" script to package.json");
  }

  const installDeps = await p.confirm({
    message: "Install security dependencies (zod, server-only, @supabase/ssr) and audit script deps (ts-node, chalk)?",
    initialValue: true,
  });
  if (p.isCancel(installDeps)) {
    p.outro(chalk.hex(BLUE)("Restormel injection complete."));
    process.exit(0);
  }
  if (installDeps) {
    const pm = getPackageManager(cwd);
    const spin = p.spinner();
    spin.start(`Installing dependencies (${pm})...`);
    try {
      if (pm === "pnpm") {
        await execa("pnpm", ["add", "-w", "zod", "server-only", "@supabase/ssr"], { cwd, stdio: "inherit" });
        await execa("pnpm", ["add", "-w", "-D", "ts-node", "chalk"], { cwd, stdio: "inherit" });
      } else if (pm === "yarn") {
        await execa("yarn", ["add", "zod", "server-only", "@supabase/ssr"], { cwd, stdio: "inherit" });
        await execa("yarn", ["add", "-D", "ts-node", "chalk"], { cwd, stdio: "inherit" });
      } else {
        await execa("npm", ["install", "zod", "server-only", "@supabase/ssr"], { cwd, stdio: "inherit" });
        await execa("npm", ["install", "-D", "ts-node", "chalk"], { cwd, stdio: "inherit" });
      }
      spin.stop("Installed.");
    } catch (err) {
      spin.stop("Install failed.");
      console.error(chalk.yellow("Install error:"), err instanceof Error ? err.message : err);
      const manualCmd = pm === "pnpm" ? "pnpm add -w zod server-only @supabase/ssr && pnpm add -w -D ts-node chalk" : pm === "yarn" ? "yarn add zod server-only @supabase/ssr && yarn add -D ts-node chalk" : "npm install zod server-only @supabase/ssr && npm install -D ts-node chalk";
      console.error(chalk.gray(`You can install manually: ${manualCmd}`));
    }
  }
  p.outro(chalk.hex(BLUE)("Restormel injection complete. ") + "🏰");
}

async function main(): Promise<void> {
  program
    .name("restormel")
    .description("Official CLI for Restormel — bank-grade security architecture for Next.js")
    .version(RESTORMEL_VERSION);

  program.parse();

  const cwd = process.cwd();
  const updateCheckPromise = checkForCliUpdate();
  p.intro(getHeader());

  try {
    if (isGreenfield(cwd)) {
      await runGreenfield(cwd);
    } else {
      await runBrownfield(cwd);
    }
  } catch (err) {
    console.error(chalk.red("Unexpected error:"), err instanceof Error ? err.message : err);
    process.exit(1);
  }

  const updateMsg = await updateCheckPromise;
  if (updateMsg) console.log("\n" + updateMsg);
}

main();
