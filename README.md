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

During local development, submissions are stored in `data/inquiries.json`. For production, connect this API route to email, PostgreSQL, or a CRM.
