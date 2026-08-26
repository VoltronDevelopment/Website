# Voltron Website

Single-page full-stack Next.js website for Voltron Coating Solutions, plus Founder Admin (`/admin`).

## Run locally

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

Admin: `http://localhost:3000/admin`. Set `ADMIN_CREDENTIALS` and `ADMIN_SESSION_SECRET` in `.env.local` (see `.env.example`). Generate hashes with `npm run admin:hash-password -- "your-strong-password"`. Do not reuse previously published founder passwords.

Leave `PROJECTS_TABLE_NAME` and `REVIEWS_TABLE_NAME` blank locally to use `data/projects.json` and `data/reviews.json`.

## Backend

### Public inquiries

The quote/contact form posts to `POST /api/inquiries`.

Local default: `data/inquiries.json`. Production: DynamoDB table `VoltronWebsiteInquiries`.

### Founder Admin

- Login: `POST /api/admin/login`
- Projects / milestones / workstreams / reviews under `/api/admin/projects…`
- Live Gantt is read-only; edits go through **Start review → Save & apply**

## Production (AWS Amplify)

### 1. DynamoDB tables

Create (or re-run) tables with partition key `id` (String), on-demand:

| Table | Env var |
|-------|---------|
| `VoltronWebsiteInquiries` | `INQUIRIES_TABLE_NAME` |
| `VoltronWebsiteProjects` | `PROJECTS_TABLE_NAME` |
| `VoltronWebsiteReviews` | `REVIEWS_TABLE_NAME` |

```powershell
npm run admin:ensure-tables
```

CloudFormation template: `infra/dynamodb-tables.json`.

### 2. IAM (already done in account `328833518871`)

SSR compute role: `VoltronWebsiteAmplifyComputeRole`  
Policy attached: `VoltronWebsiteBackendAccess`  
(`arn:aws:iam::328833518871:policy/VoltronWebsiteBackendAccess`)

This is **separate from** `VOS-Academy` / `VoltronAcademyAmplifyComputeRole`.

Source JSON: `infra/amplify-compute-policy.json`.

### 3. Amplify app

| | |
|--|--|
| App name | `Website` (Amplify console) |
| App ID | `d249bqg5o2liz1` |
| Region | `us-east-1` (GitHub-connected production app) |
| Platform | `WEB_COMPUTE` (Next.js SSR) |
| Default URL | `https://main.d249bqg5o2liz1.amplifyapp.com` |
| Compute role | `VoltronWebsiteAmplifyComputeRole` |

A separate pre-provisioned app `Voltron-Website` (`d1e3dp517f391n`) exists in `ap-south-1` without GitHub — use the **us-east-1** app above for deploys.

Connect the GitHub repo `VoltronDevelopment/Website` → branch `main` in the Amplify console if the branch is not linked yet. Admin secrets must be set (and rotated) in the Amplify console — not in this repo.

### 4. Amplify environment variables

Set non-secret table/region/URL values as Amplify console env vars. Set admin secrets in the Amplify console (or Secrets Manager) — never in git.

```text
VOLTRON_AWS_REGION=ap-south-1
INQUIRIES_TABLE_NAME=VoltronWebsiteInquiries
PROJECTS_TABLE_NAME=VoltronWebsiteProjects
REVIEWS_TABLE_NAME=VoltronWebsiteReviews
SES_FROM_EMAIL=info@voltroncoat.com
INQUIRY_TO_EMAIL=info@voltroncoat.com
NEXT_PUBLIC_SITE_URL=https://voltroncoat.com
ADMIN_SESSION_SECRET=<generate-a-new-long-random-string>
ADMIN_CREDENTIALS=<user:scrypt-hash,comma-separated>
```

Treat previously committed or documented admin passwords and session secrets as compromised. Rotate `ADMIN_CREDENTIALS` and `ADMIN_SESSION_SECRET` in the Amplify console (this invalidates existing admin sessions). Do not reuse values from the retired `.amplify-release-secrets.json` dump.

Admin secrets are read at **runtime** from Amplify env (not baked into the build artifact). `amplify.yml` copies `ADMIN_CREDENTIALS` and `ADMIN_SESSION_SECRET` from the Amplify console into `.env.production` at build time — it does not read a secrets JSON file.

Hash a password:

```powershell
npm run admin:hash-password -- "your-strong-password"
```

Paste the `scrypt$…` value after the username in `ADMIN_CREDENTIALS` in the Amplify console.

### 5. Smoke test after deploy

1. Open `/admin/login` (not linked from the public site nav).
2. Sign in → open Voltron Alpha → **Start review** → change a task → **Save & apply**.
3. Reload the project page and confirm the change persisted.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run admin:ensure-tables` | Create DynamoDB tables if missing |
| `npm run admin:hash-password` | Hash a password for `ADMIN_CREDENTIALS` |
| `npm run optimize-images` | Compress public PNGs to WebP for mobile-sized delivery |
