# Admin AI delivery

Status: implemented and backend deployed; public frontend publication and authenticated visual walkthrough pending

Outcome: existing /admin supports link + image intake, evidence-based Vietnamese AI drafts, referral/coupon mapping, secure writes/uploads, automatic whole-site image checks.

Constraints: preserve public site and database records; server-side credentials; do not invent discounts or overwrite uploaded images; keep existing manual editing. No unrelated UI or data changes.

Acceptance:
- Server verifies login/session before analysis, upload, writes, inventory and image replacement.
- AI reads public website content and related official pages, returns sources and editable fields.
- Original referral link survives analysis; referral identifiers and coupon codes remain distinct.
- All galleries/logos, deals and article images are inventoried with pagination; browser decoding catches HTTP-200 corrupt files; automatic scan on login, manual rerun/cancel, precise replacement.
- Focused negative-path tests, lint/build, independent review, local UI and live backend verification.

Phases: inspect (done), API/shared contracts, admin integration, verification/review, docs/setup.

Deployment: new isolated Cloudflare admin Worker; existing public database access stays read-only. Frontend publication requires user's normal GitHub/deployment workflow.
