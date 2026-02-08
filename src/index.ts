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
  const spinner = p.spinner();
  spinner.start("Creating your Restormel Next.js project in this folder...");
  try {
    await execa("npx", [
      "create-next-app@latest",
      "-e",
      sourceUrl,
      ".",
    ], { cwd, stdio: "inherit" });
    spinner.stop("Project created.");
    p.outro(chalk.hex(BLUE)("Success ") + "🏰 " + chalk.white("Your Restormel project is ready in this folder."));
  } catch (err) {
    spinner.stop("Creation failed.");
    const msg = err instanceof Error ? err.message : String(err);
    console.error(chalk.red("Error:"), msg);
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
  const confirmInject = await p.confirm({
    message: "Inject Restormel Security Architecture into this project?",
    initialValue: true,
  });
  if (p.isCancel(confirmInject) || !confirmInject) {
    p.cancel("Injection skipped.");
    process.exit(0);
  }

  const spinner = p.spinner();
  spinner.start("Fetching Restormel rules...");
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
    message: "Install security dependencies (zod, server-only, @supabase/ssr)?",
    initialValue: true,
  });
  if (p.isCancel(installDeps)) {
    p.outro(chalk.hex(BLUE)("Restormel injection complete."));
    process.exit(0);
  }
  if (installDeps) {
    const pm = getPackageManager(cwd);
    const spin = p.spinner();
    spin.start(`Installing security dependencies (${pm})...`);
    try {
      if (pm === "pnpm") {
        await execa("pnpm", ["add", "zod", "server-only", "@supabase/ssr"], { cwd, stdio: "inherit" });
      } else if (pm === "yarn") {
        await execa("yarn", ["add", "zod", "server-only", "@supabase/ssr"], { cwd, stdio: "inherit" });
      } else {
        await execa("npm", ["install", "zod", "server-only", "@supabase/ssr"], { cwd, stdio: "inherit" });
      }
      spin.stop("Installed.");
    } catch (err) {
      spin.stop("Install failed.");
      console.error(chalk.yellow("Install error:"), err instanceof Error ? err.message : err);
      console.error(chalk.gray(`You can install manually: ${pm} add zod server-only @supabase/ssr`));
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
}

main();
