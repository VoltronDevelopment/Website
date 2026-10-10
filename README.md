# Voltron Website

Marketing site for Voltron Coating Solutions, plus the public inquiry form.

## Run locally

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

Leave `INQUIRIES_TABLE_NAME` blank locally to use `data/inquiries.json`. Local writes use process-local serialization and atomic replacement. Use the configured DynamoDB adapter for multiple application instances.

## Backend

The quote/contact form posts to `POST /api/inquiries`.

Local default: `data/inquiries.json`. Production: DynamoDB table `VoltronWebsiteInquiries`.

## Production (AWS Amplify)

### 1. DynamoDB

Create (or re-run) the inquiries table with partition key `id` (String), on-demand:

| Table | Env var |
|-------|---------|
| `VoltronWebsiteInquiries` | `INQUIRIES_TABLE_NAME` |

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

Connect the GitHub repo `VoltronDevelopment/Website` → branch `main` in the Amplify console if the branch is not linked yet.

### 4. Amplify environment variables

Set these as Amplify console env vars. Never commit secrets.

```text
VOLTRON_AWS_REGION=ap-south-1
INQUIRIES_TABLE_NAME=VoltronWebsiteInquiries
SES_FROM_EMAIL=info@voltroncoat.com
INQUIRY_TO_EMAIL=info@voltroncoat.com
NEXT_PUBLIC_SITE_URL=https://www.voltronlattice.com
```

### 5. Smoke test after deploy

1. Open the homepage and confirm the header/hero logo.
2. Submit the partner/inquiry form and confirm a success response.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run optimize-images` | Compress public PNGs to WebP for mobile-sized delivery |
