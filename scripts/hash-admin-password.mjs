#!/usr/bin/env node
/**
 * Hash an admin password for ADMIN_CREDENTIALS.
 * Usage: npm run admin:hash-password -- "your-password"
 */
import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error('Usage: npm run admin:hash-password -- "your-password"');
  process.exit(1);
}

const salt = randomBytes(16).toString("base64url");
const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString("base64url");
const stored = `scrypt$${salt}$${hash}`;

console.log(stored);
console.log("");
console.log("Example Amplify env:");
console.log(`ADMIN_CREDENTIALS=omkar:${stored}`);
