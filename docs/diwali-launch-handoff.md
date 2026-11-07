# Diwali launch handoff

The public opening time is midnight IST at the start of Sunday, 8 November 2026, or 18:30 UTC on 7 November. The production default lives in `lib/launch.ts`. Leave the rehearsal override `VOLTRON_LAUNCH_AT` unset on the production branch.

First-time homepage visitors see the brand tile. Until opening, the countdown and founder sign-in share that page. A waiting tab confirms the opening with the server. Enter Lattice becomes available immediately, fireworks run until three minutes after the opening time, and the Diwali greeting lasts through launch day. Audio starts on request. A visitor who enters can return to Home in the same browser session. After opening, shared links can lead directly to an interior page.

## Before authorizing production

1. Use database-only capture. Leave `VOLTRON_INQUIRY_EMAIL` unset or set it to `0`. Both forms issue a receipt after a successful database write. Review the saved record in the inquiries table using this receipt.
2. Apply the table configuration in `infra/dynamodb-tables.json` to the existing inquiries table. Enable expiration on `ttlEpoch`; only rate-limit records have that attribute. Preserve existing inquiry receipts.
3. Supply the intended branch's region and table via the environment and run `node scripts/check-inquiry-readiness.mjs`. It performs read-only checks. Verify the compute role against the supplied inquiry policy.
4. Build and test the frozen release source. Run the midnight rehearsal with `node scripts/verify-brand-launch.cjs` against the production build. Set `AUDIT_BROWSER=chromium` for Playwright's bundled browser. Its database and email adapters run locally.
5. After deployment approval, record the hosted revision and build job. Verify the brand entry, founder or public state at the current time, a shared page link, and one authorized inquiry through to its database receipt. Perform the first-load factory and projection check on a physical mobile device.

## Optional email delivery after launch

To add email later, verify the sender and recipient in Mumbai SES, check the compute role's email permission, and explicitly enable `VOLTRON_INQUIRY_EMAIL=1`. Database-only receipts are excluded from the email queue. Use an operator identity with access to the intended environment. Run `node --experimental-strip-types scripts/inquiry-delivery.mjs` to inspect outstanding delivery. For a failed receipt, use the same command with `--retry RECEIPT`. That action sends a real notification. Check delivery evidence before intervening in an ambiguous or interrupted send.
