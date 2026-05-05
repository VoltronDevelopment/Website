# Voltron Website

Single-page full-stack Next.js website for Voltron Coating Solutions.

## Run locally

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

## Backend

The quote/contact form posts to `POST /api/inquiries`.

During local development, submissions are stored in `data/inquiries.json` unless `INQUIRIES_TABLE_NAME` is configured.

For production on AWS Amplify:

1. Create a DynamoDB table named `VoltronWebsiteInquiries` with partition key `id` as a string.
2. Verify the sender email identity in AWS SES, for example `info@voltroncoat.com`.
3. Give the Amplify SSR compute role permission to write to DynamoDB and send SES email.
4. Add these environment variables in Amplify:

```text
VOLTRON_AWS_REGION=ap-south-1
INQUIRIES_TABLE_NAME=VoltronWebsiteInquiries
SES_FROM_EMAIL=info@voltroncoat.com
INQUIRY_TO_EMAIL=infor@voltroncoat.com
```

## Company Profile

Place the company profile PDF at:

```text
public/voltron-company-profile.pdf
```

The hero download button points to `/voltron-company-profile.pdf`.
