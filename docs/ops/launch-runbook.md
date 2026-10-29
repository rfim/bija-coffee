# Launch runbook

How to run the Bija website, web shop and app once the hosted version is live. Written for the owner and whoever looks after the site. Each section says what to do and how often.

**Status:** draft for launch. The site on GitHub Pages runs in demo mode (data stays in each browser). This runbook covers the hosted version: the same pages on GitHub Pages with orders, Bija Card points, gift cards and staff data held in Supabase. Anything marked **(to confirm)** needs a decision before launch.

| Item | Value |
|---|---|
| Website and app | GitHub Pages, repo `rfim/bija-coffee`, branch `main` |
| Database and sign-in | Supabase project **`bija`**, region **London (`eu-west-2`)** |
| Card payments | Stripe or Square (to confirm), see [Card payments](#card-payments) |
| Data protection contact | info@bijalondon.co.uk (as in `privacy.html`) |
| Related docs | [incident-response.md](incident-response.md), [release-checklist.md](release-checklist.md) |

## Contacts and access

Fill this in before launch and keep a printed copy behind the counter. Store passwords in a password manager, never in this repo.

| Role | Name | Phone | Has access to |
|---|---|---|---|
| Owner | | | Supabase (owner), payment provider (owner), GitHub, domain |
| Deputy (manager) | | | Supabase (read), payment provider (refunds), staff PINs |
| Site support | | | GitHub (write), Supabase (developer) |

At least two people must be able to sign in to Supabase and to the payment provider, each with their own account and two-factor authentication turned on. Never share one login.

## Supabase backups

The project `bija` holds orders, Beans Club subscriptions, Bija Card points, gift card balances and staff accounts. Losing it means losing customers' points and balances, so back it up.

**Plan.** Use the Pro plan (or higher) for launch. It includes daily backups kept for 7 days. The Free plan has no downloadable backups and pauses a project after a week without activity, which would stop orders. Consider the Point-in-Time Recovery add-on once order volume justifies it (it lets you restore to any minute, not just the last daily backup).

**Region.** Keep the project in London (`eu-west-2`). This keeps customer data in the UK, which is what the privacy notice says. If Supabase ever needs to move it, update the privacy notice first.

**Our own copy (weekly).** Supabase's backups live inside Supabase. Keep a second copy outside it:

1. In the Supabase dashboard, open **Project settings → Database** and copy the connection string (use the session pooler string).
2. On a trusted computer, run:
   ```sh
   pg_dump "<connection string>" --format=custom --no-owner --file="bija-$(date +%F).dump"
   ```
3. Store the file in the owner's encrypted cloud storage (not email, not a shared drive). It contains personal data.
4. Keep 8 weekly copies and delete older ones, so we don't keep personal data longer than the privacy notice says.

**Test a restore every 3 months.** Create a temporary Supabase project in London, restore the latest dump into it (`pg_restore --no-owner --dbname="<temp connection string>" bija-YYYY-MM-DD.dump`), check that the order, points and gift card counts match production, then delete the temporary project. Write the date and result in the log at the end of this file. A backup we have never restored doesn't count as a backup.

**Restoring production.** Only the owner decides to restore, because it rolls back orders and points taken since the backup. Follow [incident-response.md](incident-response.md): note the last good time, pause online ordering, restore from **Database → Backups**, then re-enter any orders taken since the backup from the payment provider's records.

## Staff PIN rotation

Staff open the Barista view with a personal PIN. A PIN gives access to the order queue, member details, gift cards and (for managers) finance, so treat it like a key.

**Rules**

- One PIN per person. Never share a PIN or use a "shop PIN".
- 6 digits. No birthdays, repeats (`111111`) or runs (`123456`).
- Managers' PINs unlock finance and gift card changes; give the manager role only to people who need it.

**When to change PINs**

| When | What to do |
|---|---|
| Every 90 days | Every member of staff sets a new PIN. Put it in the weekly checklist when it's due. |
| Someone leaves | Remove their staff account **the same day**, before their last shift ends if possible. |
| A PIN may have been seen or shared | Reset that person's PIN now. |
| A device with the Barista view is lost or stolen | Reset every PIN that was used on it, sign the device out in Supabase (**Authentication → Users → sign out**), and follow [incident-response.md](incident-response.md). |

**How (to confirm once the staff screen is built):** the owner opens the Barista view → **Staff**, chooses the person, and selects **Reset PIN**. The person enters their new PIN on the shop tablet in private. Supabase stores a hash, never the PIN itself, so nobody (including the owner) can look a PIN up; a forgotten PIN is reset, not recovered.

Check the Supabase sign-in logs (**Authentication → Logs**) in the weekly checklist for repeated failed PIN attempts.

## If orders stop arriving

Symptoms: the Barista queue stays empty at a busy time, customers say they paid but nothing shows, or the shop page shows an error.

Work through these in order. Most steps take a minute.

1. **Is it just this device?** Reload the Barista view. Check the tablet has Wi-Fi (open any other website). Sign out and back in.
2. **Is the site up?** Open https://rfim.github.io/bija-coffee/shop.html on your phone using mobile data. If it doesn't load, check https://www.githubstatus.com.
3. **Is Supabase up?** Check https://status.supabase.com (look for `eu-west-2`). In the dashboard, make sure project `bija` is not **Paused** and has not hit a usage limit (**Project settings → Usage** and **Billing**).
4. **Is the payment provider up?** Check https://status.stripe.com or https://issuewatch.squareup.com (whichever we use). In the provider dashboard, look for payments in the last hour. If payments are arriving there but not in the queue, the problem is between the provider and Supabase: go to **Database → Logs** and **Edge Functions → Logs** in Supabase and look for errors.
5. **Did a release just go out?** Check the latest commit on `main` and the **Actions** tab. If problems started straight after a release, roll it back (see [release-checklist.md](release-checklist.md#rolling-back)).

**While it's broken**

- Put a sign on the counter and take orders in person.
- If customers can still pay online but orders don't reach the queue, **pause online ordering** (to confirm: the switch in Barista view → Settings) so nobody pays for an order that won't be made.
- Take paid-but-missing orders from the payment provider's dashboard and make them by hand.
- Once fixed, check that each payment taken during the outage has a matching order, and refund anything that wasn't fulfilled.

If it isn't fixed in 30 minutes, call site support and open an incident (see [incident-response.md](incident-response.md)).

## UK GDPR data subject requests

Anyone can ask what personal data we hold about them, or ask us to correct it, delete it, stop using it, or send it to them in a portable format. They can ask by email, in person, on social media, or by telling a member of staff. They don't have to use any particular words.

**Deadline: reply within one month of receiving the request.** If the request arrives on 3 March, the deadline is 3 April. For complex or multiple requests we can extend by up to two more months, but we must tell the person within the first month and explain why. It is free unless the request is clearly unfounded or excessive.

**Steps**

1. **Log it the same day** in the requests log (see below): date received, who, what they asked for, deadline.
2. **Check it's really them**, using only what we already know (for example, reply from the email address on their Bija Card account). Don't ask for more ID than you need. If you do need ID, the month starts once you have it.
3. **Find their data** in Supabase (customer record, orders, Bija Card points and history, gift cards, Beans Club subscription), the payment provider (payments and refunds), and the inbox. Staff should search by email and phone number.
4. **Respond.**
   - *Access:* send a copy of their data (a CSV export from Supabase is fine) with what we use it for, who we share it with, and how long we keep it (from `privacy.html`).
   - *Correction:* fix it and confirm.
   - *Deletion:* delete their account and personal details. We must keep records of sales for tax (6 years, HMRC), so anonymise those orders rather than deleting them. Tell them what we kept and why. Unused gift card balances and points are lost on deletion, so tell them first.
   - *Objection to marketing:* stop immediately, no exceptions.
5. **Record what you did** and the date you replied.

If you're not sure, ask before the deadline rather than after. The ICO's guidance is at https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/.

**Requests log:** keep it in the owner's encrypted storage (not in this repo), with columns: date received, requester, request type, ID checked (y/n), deadline, extended (y/n and reason), date completed, notes.

If the request mentions a data breach or a complaint to the ICO, tell the owner the same day.

## Card payments

**Decision needed before launch: Stripe or Square.** Until then the checkout is a demo and takes no payment.

| | Stripe | Square |
|---|---|---|
| Fits best if | Online is the main channel, or we want Beans Club subscriptions billed automatically | We also want card readers and a till in the shop, with one dashboard for both |
| Subscriptions (Beans Club) | Stripe Billing: skip, pause and cancel supported | Square Subscriptions: more limited, check skip/pause |
| In-shop card reader | Stripe Terminal (needs development work) | Square readers and POS, ready to use |
| Payouts | To the business bank account, daily by default | To the business bank account, next working day by default |

Check each provider's current UK pricing on their website before deciding; fees change.

**Onboarding notes (either provider)**

1. **Who signs up:** the owner, as the company (Companies House name and number, as in the site footer), not as an individual.
2. **Have ready:** company number, registered address, director's ID and home address, business bank account details, website URL, a short description ("specialty coffee shop and online coffee bean retailer"), refund and delivery policy pages (`delivery.html`).
3. **Use the hosted checkout** (Stripe Checkout or Square Online Checkout / Web Payments SDK). Card details then never touch our pages or Supabase, which keeps us in the smallest PCI DSS scope (SAQ A). Never store card numbers anywhere.
4. **Strong Customer Authentication (3-D Secure)** is required for UK cards; the hosted checkout handles it.
5. **Keys:** the publishable key can go in the site; the secret key goes **only** in Supabase Edge Function secrets (**Edge Functions → Secrets**), never in this repo or in the browser. Restrict the key to the permissions it needs.
6. **Webhooks:** the provider tells Supabase when a payment succeeds, and that is what creates the order in the Barista queue. Verify the webhook signature. Test with the provider's test mode and test cards before going live, including a failed card and a refund.
7. **Turn on two-factor authentication** for every dashboard login and add the deputy as a second user with limited rights (refunds only).
8. **Update `privacy.html`** to name the payment provider as a processor, and add it to the list of who we share data with.
9. **Go-live check:** one real low-value purchase on the live site, see it reach the Barista queue, then refund it.

## Weekly owner checklist

About 20 minutes, same day each week (for example Monday morning before opening).

- [ ] **Orders:** payments in the provider dashboard match orders in the Barista view for the week. Investigate any payment without an order.
- [ ] **Refunds and disputes:** respond to any chargeback or dispute in the provider dashboard (they have deadlines).
- [ ] **Payouts:** last week's payouts arrived in the bank account.
- [ ] **Backups:** latest daily backup shows in Supabase (**Database → Backups**); take the weekly `pg_dump` copy; delete copies older than 8 weeks.
- [ ] **Supabase health:** project not near usage limits; no new warnings in **Advisors** (security and performance).
- [ ] **Staff access:** everyone with a staff account still works here; nobody has a role they don't need; no repeated failed PIN attempts in the sign-in logs; PIN rotation done if 90 days are up.
- [ ] **Data requests:** any open request in the requests log is on track to meet its deadline.
- [ ] **Inbox:** info@bijalondon.co.uk checked for complaints, data requests and delivery problems.
- [ ] **Site:** latest runs on the **Actions** tab are green (CI and Lighthouse); open the website, shop and app on a phone and check they load.
- [ ] **Stock and menu:** sold-out beans and drinks marked in the app; prices still right.
- [ ] **Beans Club:** this week's subscription orders dispatched; Royal Mail tracking added.

## Logs

| Date | What (restore test, PIN rotation, incident, ...) | Who | Result |
|---|---|---|---|
| | | | |
