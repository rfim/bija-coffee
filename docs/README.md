# Bija docs

| File | What it is |
|---|---|
| `fullstack/security-review.md` | Security review of `app.html`: how a customer could fake points, gift balance or order status, or read others' data, with a fix for each. |
| `fullstack/pos-integration.md` | Till (POS) comparison (Square, SumUp, Lightspeed, Epos Now): fees, daily takings exports, APIs, automatic Bija Card points, recommended path. |
| `fullstack/analytics.md` | Analytics plan: event list, cookie-free tool choice (Plausible) under UK GDPR/PECR, setup steps. The wrapper is `../bija-analytics.js`. |
| `finance/bija-unit-economics.xlsx` | Finance model: inputs (all assumptions to replace), monthly P&L for 3 scenarios, break-even transactions per day, 13-week cash flow. |
| `ops/runbook.md` | Launch runbook: contacts, Supabase backups and restore drill, staff PINs, incident steps if orders stop, data subject requests (one month), retention. |
| `ops/weekly-owner-checklist.md` | 30-minute Monday checklist for the owner. |
| `../tests/README.md` | How to run the test suites, accessibility audit, link checker and Lighthouse locally (CI: `.github/workflows/`). |
| `finance/build_unit_economics.py` | Script that builds the workbook (openpyxl). Only needed to change its structure. |

VAT and tax figures in these docs are general guidance. Confirm them with Bija's accountant. Keep business records for 6 years (HMRC).
