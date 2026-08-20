# Voltron Website

Single-page full-stack Next.js website for Voltron Coating Solutions, plus Founder Admin (`/admin`).

## Run locally

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

Admin (local defaults when env is unset): `http://localhost:3000/admin` — user `omkar` / password `voltron`.

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
| App name | `Voltron-Website` |
| App ID | `d1e3dp517f391n` |
| Region | `ap-south-1` |
| Platform | `WEB_COMPUTE` (Next.js SSR) |
| Default URL | `https://d1e3dp517f391n.amplifyapp.com` |
| Compute role | `VoltronWebsiteAmplifyComputeRole` |

Connect the GitHub repo `VoltronDevelopment/Website` → branch `main` in the Amplify console if the branch is not linked yet. Env vars below are already set on the app.

### 4. Amplify environment variables

```text
VOLTRON_AWS_REGION=ap-south-1
INQUIRIES_TABLE_NAME=VoltronWebsiteInquiries
PROJECTS_TABLE_NAME=VoltronWebsiteProjects
REVIEWS_TABLE_NAME=VoltronWebsiteReviews
SES_FROM_EMAIL=info@voltroncoat.com
INQUIRY_TO_EMAIL=info@voltroncoat.com
NEXT_PUBLIC_SITE_URL=https://voltroncoat.com
ADMIN_SESSION_SECRET=<long-random-string>
ADMIN_CREDENTIALS=omkar:<scrypt-or-password>
```

Hash a password:

```powershell
npm run admin:hash-password -- "your-strong-password"
```

Paste the `scrypt$…` value after `omkar:` in `ADMIN_CREDENTIALS`.

`amplify.yml` exports these vars into `.env.production` at build time.

### 5. Smoke test after deploy

1. Open `/admin/login` (not linked from the public site nav).
2. Sign in → open Voltron Alpha → **Start review** → change a task → **Save & apply**.
3. Reload the project page and confirm the change persisted.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run admin:ensure-tables` | Create DynamoDB tables if missing |
| `npm run admin:hash-password` | Hash a password for `ADMIN_CREDENTIALS` |
| `npm run optimize-images` | Compress public images |
