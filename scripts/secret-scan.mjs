#!/usr/bin/env node
/**
 * Fail-closed secret scan for Voltron product trees.
 * Flags live defaults of the retired integration key, committed secret files,
 * and common cloud/token patterns. Deny-list / rejection-test mentions are allowed.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const RETIRED_KEY = "voltron-dev-integration";
const SKIP_DIRS = new Set([
  ".git",
  ".next",
  ".turbo",
  "node_modules",
  "bin",
  "obj",
  "dist",
  "coverage",
  "artifacts",
  "data",
  ".integration-data",
  "secrets"
]);
const SCAN_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".yml",
  ".yaml",
  ".md",
  ".ps1",
  ".sh",
  ".env",
  ".cs",
  ".csproj",
  ".xml",
  ".txt",
  ".example",
  ".html",
  ".css",
  ".scss",
  ".conf",
  ".config",
  ".properties",
  ".init"
]);
const SKIP_FILES = new Set(["package-lock.json", "pnpm-lock.yaml", "yarn.lock"]);

const PATTERNS = [
  { rule: "aws-access-key", regex: /\bAKIA[0-9A-Z]{16}\b/g },
  { rule: "private-key", regex: /-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----/g },
  { rule: "github-token", regex: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g },
  { rule: "slack-token", regex: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g }
];

function argValue(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : null;
}

function resolveContext() {
  const rootArg = argValue("--root");
  if (rootArg) {
    return { root: resolve(rootArg), trees: ["."] };
  }

  const parent = resolve(scriptDir, "..");
  const parentName = parent.split(/[/\\]/).filter(Boolean).at(-1) ?? "";
  const productRoots = new Set([
    "Voltron ERP",
    "Voltron Website",
    "Voltron SCADA",
    "Voltron Digital Twin"
  ]);
  if (productRoots.has(parentName) && !process.argv.includes("--all")) {
    return { root: parent, trees: ["."] };
  }

  const candidates = [parent, resolve(scriptDir, "../.."), process.cwd()];
  for (const candidate of candidates) {
    if (
      existsSync(join(candidate, "Voltron ERP", "package.json"))
      && existsSync(join(candidate, "Voltron Website", "package.json"))
    ) {
      return {
        root: candidate,
        trees: ["Voltron ERP", "Voltron SCADA", "Voltron Digital Twin", "Voltron Website"]
      };
    }
  }

  return { root: process.cwd(), trees: ["."] };
}

function isDeniedListFile(relativePath) {
  const normalized = relativePath.replaceAll("\\", "/");
  return /(^|\/)(secret-scan\.mjs|integrationAuthKeys\.ts|IntegrationKeyAuth\.cs|integration-key\.mjs|verify-production-database\.mjs)$/.test(normalized)
    || /(^|\/)\.env\.example$/.test(normalized)
    || /\.test\.(ts|tsx|js|mjs)$/.test(normalized)
    || /Tests\.cs$/.test(normalized)
    || /(^|\/)e2e\/.+\.spec\.ts$/.test(normalized);
}

function isSecretDumpFile(relativePath) {
  const normalized = relativePath.replaceAll("\\", "/");
  return /(^|\/)\.amplify-release-secrets\.json$/.test(normalized)
    || /(^|\/).*(credentials|secrets)\.json$/.test(normalized) && !normalized.includes("node_modules");
}

function retiredKeyAllowed(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("#") || trimmed.startsWith("*") || trimmed.startsWith("<!--")) {
    return true;
  }
  if (/compromised|retired|rejected|must not|do not inject|the retired value/i.test(line)) {
    return true;
  }
  if (/COMPROMISED|CompromisedKeys/.test(line)) {
    return true;
  }
  if (/Assert\.False|toBe\(false\)|toContain\(|throw new Error|throw "/i.test(line)) {
    return true;
  }
  if (/if\s*\(.*voltron-dev-integration/.test(line)) {
    return true;
  }
  return false;
}

function collectFiles(dir, files = []) {
  if (!existsSync(dir)) {
    return files;
  }

  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry) || SKIP_FILES.has(entry)) {
      continue;
    }
    const fullPath = join(dir, entry);
    let stats;
    try {
      stats = statSync(fullPath);
    } catch {
      continue;
    }
    if (stats.isDirectory()) {
      collectFiles(fullPath, files);
      continue;
    }
    const extension = extname(entry).toLowerCase();
    if (entry.startsWith(".env") || SCAN_EXTENSIONS.has(extension) || isSecretDumpFile(entry)) {
      files.push(fullPath);
    }
  }
  return files;
}

function scanFile(root, filePath) {
  const relativePath = relative(root, filePath);
  const findings = [];

  if (isSecretDumpFile(relativePath)) {
    findings.push({
      file: relativePath,
      line: 1,
      rule: "committed-secrets-file",
      excerpt: "Committed secrets file must not be in source control."
    });
    return findings;
  }

  if (isDeniedListFile(relativePath)) {
    return findings;
  }

  let text;
  try {
    text = readFileSync(filePath, "utf8");
  } catch {
    return findings;
  }

  if (text.includes("\u0000")) {
    return findings;
  }

  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    if (line.includes(RETIRED_KEY) && !retiredKeyAllowed(line)) {
      findings.push({
        file: relativePath,
        line: lineNumber,
        rule: "retired-integration-key",
        excerpt: line.trim().slice(0, 200)
      });
    }

    if (
      /ADMIN_CREDENTIALS\s*=/.test(line)
      && !/ADMIN_CREDENTIALS=\$ADMIN_CREDENTIALS/.test(line)
      && !/placeholder|your-strong-password|\$\{|scrypt\$/i.test(line)
      && /ADMIN_CREDENTIALS\s*=\s*['"]?\w+:\S+/.test(line)
    ) {
      findings.push({
        file: relativePath,
        line: lineNumber,
        rule: "plaintext-credentials",
        excerpt: "Plaintext ADMIN_CREDENTIALS assignment."
      });
    }

    if (/\bpassword\s+`?voltron`?\b/i.test(line) && !/hash a password|your-strong-password/i.test(line)) {
      findings.push({
        file: relativePath,
        line: lineNumber,
        rule: "plaintext-credentials",
        excerpt: "Documented plaintext admin password."
      });
    }

    for (const pattern of PATTERNS) {
      pattern.regex.lastIndex = 0;
      if (pattern.regex.test(line)) {
        findings.push({
          file: relativePath,
          line: lineNumber,
          rule: pattern.rule,
          excerpt: line.trim().slice(0, 200)
        });
      }
    }
  });

  return findings;
}

const { root, trees } = resolveContext();
const findings = [];

for (const tree of trees) {
  const treeRoot = resolve(root, tree);
  for (const filePath of collectFiles(treeRoot)) {
    findings.push(...scanFile(root, filePath));
  }
}

if (findings.length > 0) {
  console.error(`Secret scan failed with ${findings.length} finding(s) under ${root}:`);
  for (const finding of findings) {
    console.error(`  [${finding.rule}] ${finding.file}:${finding.line}  ${finding.excerpt}`);
  }
  process.exit(1);
}

console.log(`Secret scan passed (${trees.join(", ")} under ${root}).`);
