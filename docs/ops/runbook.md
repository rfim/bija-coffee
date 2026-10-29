# Bija launch runbook

For: the owner and whoever looks after the app · Written: 29 Oct 2026 · Owner: Full stack & Finance team
Print this, keep a copy off-line, and fill in the blanks in **Contacts** before launch.

> **Where things stand.** Today the app runs on GitHub Pages in demo mode (data stays in each browser) and, in the hosted version, on the host's built-in database. The launch plan moves the data to **Supabase** with **staff PINs** for the Barista view. Sections 2 and 3 describe how to run those once they exist. Anything marked **(check)** depends on the Supabase plan chosen; confirm it on supabase.com/pricing.

## Contents
1. Contacts and access
2. Backups (Supabase)
3. Staff PINs
4. Incident: orders stop arriving
5. Other incidents (points, gift cards, data breach)
6. Data subject requests (UK GDPR)
7. Records and retention
8. Weekly owner checklist (separate page: `weekly-owner-checklist.md`)

## 1. Contacts and access

| Role | Name | How to reach | Has access to |
|---|---|---|---|
| Owner (decision maker, data controller) | | | Everything; Supabase owner; GitHub owner |
| Technical contact | | | Supabase admin, GitHub, domain |
| Accountant | | | Finance exports only |
| Till provider support | | | |
| Supabase support | support via dashboard | | |
| ICO (data breaches) | ico.org.uk/report-a-breach · 0303 123 1113 | | |

Rules:
- **At least two people** can get into Supabase, GitHub and the domain registrar, each with their own login and two-factor authentication. Never share one login.
- Keep the Supabase **service role key** only in the server function's secret settings. It must never be in `app.html`, in Git, in WhatsApp or in email.
- When someone leaves: remove their access the same day (Section 3 and the access list in the weekly checklist).

## 2. Backups (Supabase)

What needs protecting: customers and their orders, the bar records (order statuses, in-store points, gift card payments and credits), finance entries, and the menu. Gift card balances and finance records are money: losing them means paying out of pocket or failing HMRC record-keeping.

### Automatic backups
- On a paid Supabase plan, the database is backed up **daily** and kept for a number of days that depends on the plan (7 days on Pro at the time of writing) **(check)**. The free plan is not enough for a live shop: it has no downloadable backups and pauses inactive projects **(check)**.
- **Point-in-time recovery** (restore to any minute) is a paid add-on **(check)**. Recommended once the app takes real orders and gift card money, because daily backups can lose up to a day of orders.
- Files in Supabase Storage (photos, uploads) are **not** in database backups. Keep the originals in the Git repo or in a shared drive.

### Our own weekly copy (off Supabase)
Automatic backups live inside Supabase. Keep an independent copy in case the account is lost or locked.

1. Every Monday, the technical contact runs (Supabase CLI, linked to the project):
   ```bash
   supabase db dump --linked -f bija-schema-$(date +%F).sql
   supabase db dump --linked --data-only -f bija-data-$(date +%F).sql
   ```
2. Encrypt both files (for example with `age` or a password-protected 7-Zip archive, password in the owner's password manager).
3. Store them in a separate place from Supabase (the owner's business cloud drive), in a folder only the owner and technical contact can open.
4. Keep weekly copies for 3 months and the last copy of each quarter for **6 years** (finance records; Section 7). Delete older ones.
5. Tick it on the weekly checklist.

These files contain customers' personal data. Treat them like the live database: encrypted, access-limited, deleted on schedule.

### Restore drill (every 3 months, about 1 hour)
1. Create a **new, temporary** Supabase project (never restore over the live one to test).
2. Load the latest weekly copy: `psql "$TEMP_DB_URL" -f bija-schema-YYYY-MM-DD.sql` then the data file.
3. Spot-check: number of customers, last week's orders, one gift card balance, last month's finance entries against the Finance tab.
4. Write the date, time taken and any problems in the ops log. Delete the temporary project.

### Real restore (data lost or corrupted)
1. **Pause app ordering** (Barista → Queue → *Pause orders*) so nothing new is written.
2. Decide the restore point: just before the problem.
3. Use Supabase's dashboard restore (daily backup or point in time). This replaces the live database; anything after the restore point is lost, so first export what you can (Finance → CSV; screenshots of the queue).
4. Re-enter lost items from the till and paper notes: in-store points, gift card payments, daily closes.
5. Resume orders. Record what happened (Section 5, "after any incident").

## 3. Staff PINs

The Barista view lets staff change order statuses, add points, activate gift cards and (owner only) see finance. A PIN is the key to all of that.

- **One PIN per person**, never shared. 6 digits minimum. No birthdays, `123456`, or repeated digits.
- PINs are checked by the server and stored **hashed** (never in plain text, never in `app.html`). After 5 wrong tries, lock that staff login for 15 minutes.
- **Owner-only actions** (finance, menu prices, refunds of points or gift balance) need the owner's own login, not a staff PIN.
- Every staff action is logged with the staff member's name and time (who marked collected, who added points or gift balance).

**Rotate (change) PINs:**
| When | What |
|---|---|
| Someone leaves | Disable their login **the same day**, before or during their last shift. Check the last 30 days of their logged actions for anything odd. |
| A PIN might be known (seen, written down, shared) | Change that person's PIN now. |
| Every 90 days | Everyone sets a new PIN. Put the date in the weekly checklist. |
| After any suspected fraud | Change all PINs and review the action log. |

**How:** owner logs in → Staff → choose the person → *Reset PIN* → they enter a new one themselves on the shop tablet (the owner should not know it). Record "PINs rotated, date" in the ops log, never the PINs.

## 4. Incident: orders stop arriving

**Signs:** customers say they ordered but nothing appears in the Barista queue; the queue is empty at a time it is normally busy; the app shows an error when placing an order.

**First 5 minutes (any staff):**
1. On the Barista tablet, check **App ordering is On** (Barista → Queue tile). If it says Off, someone paused it: turn it back on.
2. Check the shop's internet: open any website on the tablet. If it's down, use a phone hotspot.
3. Pull down to refresh the Barista view, or close and reopen the app.
4. Place a test order from a staff phone (customer view). Does it appear in the queue within 10 seconds?

**If the test order does not appear:**
5. **Pause app ordering** so customers are not charged or left waiting for orders the bar cannot see.
6. Put up the counter sign: "App ordering is down for a moment. Please order at the counter; we'll add your Bija Card points by hand." Points can be added later with *Members → Add in-store spend*.
7. Tell the technical contact (call, don't just message) with: time it started, what you see, screenshot of any error.

**Technical contact checklist:**
- Supabase status page and the project's dashboard: is the project paused, over a usage limit, or down? Check the database and API logs for errors.
- Did anything change recently: a new deploy to GitHub Pages, a change to access rules (row-level security), a new service worker? If yes, roll back to the last working version (revert the commit; GitHub Pages redeploys in a few minutes).
- Is the app's cached copy stale? The service worker loads the network first, but ask staff to close the app fully and reopen; on a stuck device, clear site data for the domain.
- Are customers' orders saved but not shown (read rule problem) or not saved at all (write rule problem)? Check the orders table directly.

**Getting back to normal:**
8. Once a test order works end to end (placed → queue → ready → collected → points), resume app ordering.
9. Check for orders placed during the outage that were never made. Contact those customers if you can and add their points by hand.
10. Post a short note on social media only if many customers were affected.

**Severity guide:** orders down at peak (7:30–10:00 weekdays) = fix now; outside peak = within the day. Card payments at the till are separate from the app and keep working.

## 5. Other incidents

**Points or gift balance look wrong** (someone has far more than they should, or many claims for the same code):
1. Don't confirm any more gift card claims or add points for that member.
2. Screenshot their Bija Card in the Members tab and the gift card list.
3. Technical contact checks the records against the bar's ledger. The security review (`docs/fullstack/security-review.md`) lists known ways people could fake points or balance before fixes land.
4. Correct the balance from the staff side and keep a note of why (gift card balances are money you owe).

**Personal data breach** (customer data seen by someone who shouldn't, a laptop with a backup lost, a staff login misused):
1. Contain it: change PINs/passwords, revoke keys, pause ordering if needed.
2. Record what happened, what data, how many people, when you found out.
3. If there is a risk to people (for example names with order history, emails, anything financial), **report to the ICO within 72 hours** of becoming aware. If the risk is high, tell the affected customers without undue delay.
4. Keep a record even if you decide not to report, with the reason.

**After any incident:** within a week, write five lines in the ops log: what happened, when, impact (orders, customers, money), cause, what we changed so it doesn't happen again.

## 6. Data subject requests (UK GDPR)

Customers can ask to **see** their data (access), **correct** it, **delete** it, **move** it (portability) or **object** to uses of it. Requests can come any way (email, in person, social media DM) and don't need to use the words "GDPR" or "subject access".

**Deadline: one calendar month** from the day you receive it (for example, received 3 March → reply by 3 April). You can extend by up to two more months if the request is complex or you get several from the same person, but you must tell them within the first month. It is free, except for requests that are manifestly unfounded or excessive.

**Steps:**
1. **Log it** the same day in the requests register (date received, who, what they asked, due date).
2. **Check identity** in proportion: an email from the address on their account, or showing their Bija Card in the app, is usually enough. Don't ask for more than you need. The clock can pause while you wait for ID.
3. **Find their data:**
   - Customer record: name, orders, ratings and comments, Secret St James's check-ins, birth month, gift cards bought and claimed.
   - Bar record: order statuses, in-store spend and points, gift card payments and credits.
   - Web shop orders and Beans Club subscription (delivery address, email).
   - Till system, if their card is linked to their Bija Card.
   - Emails or messages with them.
   - Analytics holds no personal data (`docs/fullstack/analytics.md`), so there is nothing to search there.
4. **Respond:**
   - **Access / portability:** send a copy of the records (a readable export, e.g. a CSV or PDF) plus: why we use it, who we share it with (processors: Supabase, the till provider, Royal Mail for deliveries), how long we keep it, and their rights including complaining to the ICO.
   - **Delete:** delete the customer record and web shop profile, and anonymise the bar record (remove the name; keep amounts and dates). **Money records needed for tax are kept** for the HMRC period (Section 7). Tell them what was kept and why. If they have unspent gift card balance or points, tell them they will lose it and confirm before deleting.
   - **Correct:** fix it and confirm.
   - **Object to marketing:** stop straight away (this one has no exceptions).
5. **Close** the register entry with the date answered.

Don't share one customer's data with another person (for example a gift card buyer asking about the recipient) without the data subject's permission.

## 7. Records and retention

| Record | Keep for | Why |
|---|---|---|
| Daily closes, expenses, income, till Z-reports, supplier invoices, VAT records | **6 years** from the end of the financial year | HMRC record keeping (VAT records at least 6 years) |
| Gift card sales, payments, credits and redemptions | 6 years, and while any balance is unspent | Money owed to customers; accounts |
| Customer accounts (name, orders, ratings, birth month) | While the account is active; review accounts inactive for 2 years and delete or anonymise | Data minimisation (UK GDPR). Confirm the period with Bija and match `privacy.html` |
| Weekly encrypted backups | 3 months weekly, plus quarterly copies for 6 years | Recovery; finance records |
| Staff action log | 1 year | Fraud checks |
| Data subject request register and incident log | 6 years | Showing compliance |

Confirm these periods with the accountant and keep `privacy.html` in line with them.
