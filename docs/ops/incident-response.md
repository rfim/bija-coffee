# Incident response

What to do when something goes wrong with the Bija website, web shop or app: orders not arriving, payments failing, the site down, wrong prices or points, or personal data exposed.

See [launch-runbook.md](launch-runbook.md) for contacts, backups and the "orders stop arriving" checks.

## 1. Decide how serious it is

| Severity | Examples | Response |
|---|---|---|
| **SEV1: critical** | Personal data exposed or possibly stolen. Customers charged but no orders made. Payments taken by someone else. Staff account taken over. | Start now, at any hour. Owner leads. |
| **SEV2: major** | Online ordering down. Shop or app won't load. Points or gift balances wrong for many customers. | Start within 1 hour in opening hours. |
| **SEV3: minor** | One page broken. A wrong price or photo. Slow pages. One customer's points wrong. | Fix in the next working day or the next release. |

If you're not sure, treat it as the more serious one. It's easy to downgrade later.

## 2. First 15 minutes

1. **Say it's happening.** Message the owner and site support (see the contacts table in the runbook): what's wrong, when it started, how you noticed.
2. **Pick one lead.** The lead makes the decisions and keeps the notes. Everyone else reports to them.
3. **Start notes** with times: what you saw, what you did, what changed. Use a shared note or a paper sheet. These are needed for the review and, for a data breach, for the ICO.
4. **Stop the harm**, even before you know the cause:
   - Payments or orders going wrong → pause online ordering; take orders at the counter.
   - A release just went out → roll it back ([release-checklist.md](release-checklist.md#rolling-back)).
   - Account or PIN misuse → reset the PIN, sign the user out in Supabase, remove the account if needed.
   - A secret key may be exposed (in a commit, a screenshot, a message) → rotate it now in the provider and in Supabase Edge Function secrets. Deleting the commit is not enough.
   - Data exposed through a database rule → turn the affected feature off, then fix the rule.

## 3. Find and fix

- Check the status pages: GitHub (githubstatus.com), Supabase (status.supabase.com), and the payment provider.
- Look at what changed: the latest commits and Actions runs on `main`, recent Supabase migrations, and changes to provider settings.
- Read the logs: Supabase (**Logs**: API, Database, Auth, Edge Functions), and the payment provider's event and webhook logs.
- Fix in the smallest safe way. Prefer a rollback to a hurried fix. Any code fix goes through a pull request with CI green, even during an incident; if that's impossible, the lead approves it and a review happens afterwards.
- Restore from backup only if data is lost or corrupted, and only with the owner's agreement (see "Restoring production" in the runbook).

## 4. Personal data breaches (UK GDPR)

A personal data breach is any loss, change, disclosure or access to personal data that shouldn't happen: a wrong database rule, a lost staff tablet that was signed in, an email of customer data sent to the wrong person, a stolen login.

1. Contain it (step 2 above), then work out **what data, how many people, and since when**.
2. Decide whether it's likely to put people's rights and freedoms at risk (for example: contact details, order history or addresses exposed; any login details). The ICO's self-assessment helps: https://ico.org.uk/for-organisations/report-a-breach/
3. **If there's a risk, report it to the ICO within 72 hours** of becoming aware of it, even if you don't have every detail yet. You can add details later.
4. **If there's a high risk** to people (for example, their data could be used for fraud), tell the affected customers without undue delay: what happened, what data, what we've done, what they should do, and who to contact.
5. **Record every breach** in the breach log, including ones you decide not to report, with the reason.
6. If card data is involved, also tell the payment provider straight away.

## 5. Talking to customers

- Be honest and short. Say what's affected and what they can do now ("Order at the counter; your points are safe").
- Use the same message on the shop sign, Instagram and email.
- Don't guess the cause or promise times you can't keep.
- For refunds and missing orders, use the payment provider's records as the source of truth.

Template:

> We're having a problem with online ordering since [time]. Please order at the counter for now. If you paid online and your order didn't arrive, show us your receipt and we'll make it or refund it. Sorry for the hassle; we'll post here when it's fixed.

## 6. Close it

An incident is closed when the service works normally, every affected customer has been sorted (order made or refunded, points corrected), and any keys that may have been exposed have been rotated.

## 7. Review (within a week, SEV1 and SEV2)

Write a short, blame-free note, kept with the ops records (not in this repo if it contains personal data):

- What happened, with a timeline from the notes.
- Impact: how long, how many customers and orders, money refunded, data involved.
- Why it happened, and why we didn't catch it sooner.
- What we'll change, with an owner and a date for each action. Typical actions: a new test in `tests/`, an item on the release checklist, a monitoring check, a change to this document.

Add a line to the log at the end of the runbook.
