# Weekly owner checklist

About 30 minutes, every Monday. Tick each line, note anything odd in the ops log. Details for each item are in `runbook.md`.

Week starting: ____________  Done by: ____________

## Money
- [ ] Every day last week has a **daily close** in Finance (card + cash from the till's end-of-day report).
- [ ] **Card takings match the bank**: the card provider's payouts for last week equal the card closes (allow for fees and the one-day settlement delay).
- [ ] **Cash** banked matches the cash closes.
- [ ] Expenses and supplier invoices for the week are entered, with receipts kept (photos are fine).
- [ ] **VAT set-aside**: move the "running total to set aside" from the cash-flow sheet (`docs/finance/bija-unit-economics.xlsx`) into a separate savings pot. Confirm figures with your accountant.
- [ ] **Gift cards**: the outstanding balance (sold minus redeemed) looks right; no claims waiting more than 2 days in Barista → Gift cards.
- [ ] Cash-flow forecast: update this week's actuals; is any week in the next 13 below the minimum buffer?

## App and customers
- [ ] Barista → Insights: orders, repeat customers, rating. Read the new comments and reply or act on anything serious.
- [ ] No unusual points: check the top of Members for anyone with far more points than visits.
- [ ] Analytics: app opens and orders this week vs last week.
- [ ] Any **data requests** (see/delete my data) logged and due dates noted? Due within one month of receipt.
- [ ] Menu and prices in the app match the board in the shop; sold-out items are off.

## Safety and access
- [ ] **Backup copy** made and stored (Monday dump), and Supabase shows last night's automatic backup.
- [ ] Staff list in the app matches who works here now. Anyone who left has no login.
- [ ] PINs last rotated on: ________ (every 90 days).
- [ ] CI checks on GitHub are green (Actions tab); read the Lighthouse summary if a page got slower.
- [ ] Any incidents last week written up in the ops log.

## Monthly (first Monday of the month)
- [ ] Send the month's Finance CSV and till reports to the accountant.
- [ ] Review the unit economics sheet with real figures: transactions per day vs break-even.
- [ ] Every 3 months: restore drill (runbook Section 2).
