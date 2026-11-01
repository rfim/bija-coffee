# Builds Bija-Owner-Handbook.html and Bija-Barista-Quick-Guide.html (printed to PDF by build-pdf.js).
import base64, os
H = os.path.dirname(os.path.abspath(__file__))
def img(name, cls=''):
    p = os.path.join(H, 'crops', name)
    if not os.path.exists(p): return ''
    return f'<img class="{cls}" src="data:image/png;base64,{base64.b64encode(open(p,"rb").read()).decode()}" alt="">'
def fig(name, cap, cls=''):
    i = img(name, cls)
    return f'<figure class="{cls}">{i}<figcaption>{cap}</figcaption></figure>' if i else ''
MARK = '<svg viewBox="-2 -2 104 104" class="mk" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3"><circle cx="50" cy="25" r="25"/><circle cx="75" cy="50" r="25"/><circle cx="50" cy="75" r="25"/><circle cx="25" cy="50" r="25"/></g></svg>'
FONT = 'file:///home/user/bija-coffee/site/fonts/fonts.css'
CSS = '''@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;font:10.5pt/1.5 Inter,system-ui,sans-serif;color:#111;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:210mm;min-height:297mm;padding:16mm 16mm 14mm;page-break-after:always;position:relative}
.cover{background:#000;color:#fff;display:flex;flex-direction:column;height:297mm}.cover .mk{width:24mm;height:24mm}
.cover h1{font:900 48pt/.92 Archivo,Inter;text-transform:uppercase;margin:18mm 0 6mm}.cover p{color:#bbb;font-size:12pt;max-width:150mm}.cover .f{margin-top:auto;color:#999;font-size:9pt}
.hdr{position:absolute;top:7mm;left:16mm;right:16mm;display:flex;justify-content:space-between;font-size:7.5pt;color:#999;text-transform:uppercase;letter-spacing:.12em}.hdr .mk{width:4mm;height:4mm;vertical-align:-1mm;margin-right:2mm}
.kick{font:600 8pt Inter;letter-spacing:.2em;text-transform:uppercase;color:#777}
h2{font:900 24pt/1 Archivo,Inter;text-transform:uppercase;margin:2mm 0 5mm}h3{font:900 12pt/1.2 Archivo,Inter;text-transform:uppercase;margin:6mm 0 2mm}
ol,ul{padding-left:5.5mm;margin:0 0 3mm}li{margin-bottom:1.2mm}p{margin:0 0 3mm}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:7mm;align-items:start}.c3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:5mm}
figure{margin:0 0 4mm;break-inside:avoid}figure img{width:100%;display:block;border:1px solid #ddd;border-radius:2mm}figure.ph img{max-height:118mm;}figure.sm img{max-height:84mm !important;}figure.ph img{width:auto;max-width:100%;margin:0 auto;border-radius:4mm}figcaption{font-size:8pt;color:#555;margin-top:1.2mm}
.box{background:#f2f2f0;border-radius:3mm;padding:4mm 5mm;margin:0 0 4mm;break-inside:avoid}.box.dark{background:#0b0b0b;color:#fff}.box.dark .kick{color:#aaa}
.tag{display:inline-block;font:600 7pt Inter;letter-spacing:.08em;text-transform:uppercase;border:1px solid currentColor;border-radius:99px;padding:.3mm 2mm;margin-left:1mm;vertical-align:1px}
table{width:100%;border-collapse:collapse;font-size:9pt;margin:0 0 4mm}th,td{text-align:left;padding:1.8mm 2mm;border-bottom:1px solid #e4e4e2;vertical-align:top}th{font-size:7.5pt;letter-spacing:.08em;text-transform:uppercase;color:#666}
.chk li{list-style:none;margin-left:-5.5mm;padding-left:6mm;position:relative}.chk li::before{content:"";position:absolute;left:0;top:1.2mm;width:3mm;height:3mm;border:1.3px solid #111;border-radius:.6mm}
b.k{font-family:ui-monospace,monospace;background:#f2f2f0;border-radius:1mm;padding:0 1.2mm;font-weight:600}'''
def page(kick, title, body, hdr='Owner handbook'):
    return f'<section class="pg"><div class="hdr"><span>{MARK}Bija · {hdr}</span><span>{kick}</span></div><div style="height:6mm"></div><div class="kick">{kick}</div><h2>{title}</h2>{body}</section>'
P = []
P.append(f'''<section class="pg cover">{MARK}<h1>Owner<br>handbook</h1><p>How to run Bija's website, app, loyalty scheme, staff side and money, day by day. Written for the owner and shift leads.</p><p style="font-size:10pt">Version 1 · 30 October 2026</p><div class="f">Bija Coffee Limited · 2a St James's Market, London SW1Y 4AH · Concept build by Firman Insan M. Anything marked <b>proposal to confirm</b> is not yet agreed with Bija.</div></section>''')
P.append(page('1 · Start here', 'What you have', f'''
<div class="cols"><div>
<p>Bija now has three connected parts. They share one set of data, so an order placed on a phone appears at the bar, and the points it earns appear on the customer's Bija Card.</p>
<h3>1. The website</h3><p>Shop-first site for coffee, the Beans Club, gifts, the café menu, visit details and help pages. Phones opening the home page are taken to the app.</p>
<h3>2. The customer app</h3><p>Order ahead, the Bija Card (points and stamps), Beans Club, Secret St James's, gift cards and the Bean passport QR scanner. Works in any phone browser and can be added to the home screen; native Android and iPhone builds are prepared.</p>
<h3>3. The staff side</h3><p>Inside the same app, behind a PIN: the order queue, web and delivery orders, members, gift cards, insights, menu and the owner's Finance area.</p>
</div><div>
<div class="box"><div class="kick">Demo or live?</div><p><b>Demo</b> (today): everything is stored in the browser you are using. Good for training; nothing is shared between devices.</p><p><b>Live</b>: data is stored in Bija's Supabase database in London, shared by every phone and the bar tablet. Live mode starts once the setup steps on the next page are done.</p><p>Add <b class="k">?demo=1</b> to any app link to force the demo.</p></div>
{fig('c-home.png','The customer app home screen','ph')}
</div></div>'''))
P.append(page('2 · First-time setup', 'Setup checklist', '''
<p>Do these once, in this order. Most take a few minutes; the accounts with Apple and Google take a few days to approve.</p>
<table><tr><th style="width:5%"></th><th style="width:38%">Step</th><th>How</th></tr>
<tr><td>☐</td><td><b>Switch on the live database</b></td><td>Supabase dashboard → project <b>bija</b> → Authentication → Sign In / Providers → turn on <b>Allow anonymous sign-ins</b>. Also turn on CAPTCHA under Attack Protection. Without this the app stays in demo mode.</td></tr>
<tr><td>☐</td><td><b>Change the staff PIN</b></td><td>The demo PIN is <b class="k">111111</b>. Enter staff mode (hold the round Order button for 3 seconds, enter the PIN), open <b>Menu</b>, then <b>Change staff PIN</b>. Use 6 digits that aren't a date or a pattern. On the live database, changing the PIN signs out every other staff device.</td></tr>
<tr><td>☐</td><td><b>Choose the web address</b></td><td>Recommended: <b>bijacoffee.co.uk</b>. Until then the site runs at rfim.github.io/bija-coffee and is hidden from search engines on purpose.</td></tr>
<tr><td>☐</td><td><b>Apple Wallet and Google Wallet</b></td><td>Apple Developer Program ($99 a year), a Pass Type ID certificate, and a free Google Wallet issuer account. Add the details as Supabase secrets (steps in <b>docs/wallet/README.md</b>). The "Add to Wallet" buttons appear by themselves once this is done.</td></tr>
<tr><td>☐</td><td><b>Android app</b></td><td>The GitHub workflow publishes a test build (APK) at github.com/rfim/bija-coffee/releases (android-latest); check it has run successfully. For the Play Store: a Google Play developer account ($25), an upload key stored as GitHub secrets, then follow <b>native/README.md</b>.</td></tr>
<tr><td>☐</td><td><b>iPhone app</b></td><td>Needs the same Apple Developer account and a Mac with Xcode, or a build service. Until then iPhone customers add the web app to their home screen (install.html).</td></tr>
<tr><td>☐</td><td><b>Card payments</b></td><td>Not connected yet: customers pay at the bar. Choose Stripe or Square first (decision C2).</td></tr>
<tr><td>☐</td><td><b>Confirm the facts</b></td><td>Who roasts the coffee; the postcode (site says SW1Y 4AH, the food hygiene register lists SW1Y 4SB); the contact email (info@bijalondon.co.uk is a mock-up); opening hours; the map pin; prices.</td></tr>
<tr><td>☐</td><td><b>Book advisers</b></td><td>Accountant (VAT on beans, gift cards and loyalty) and solicitor (subscription, gift card and loyalty terms) before launch.</td></tr>
</table>'''))
P.append(page('3 · Daily routine', 'Opening and the queue', f'''
<div class="cols"><div>
<h3>Opening</h3><ol><li>On the bar tablet, open the app and hold the round <b>Order</b> button for 3 seconds. A thin ring draws round it.</li><li>Enter the staff PIN. The staff tabs appear: Queue, Web &amp; delivery, Members, Gift cards, Insights, Finance, Menu.</li><li>In <b>Menu</b>, check today's filter coffee and mark anything sold out.</li><li>In <b>Queue</b>, app ordering shows <b>On</b>. Tap <b>Pause orders</b> if the bar gets too busy; customers see that ordering is paused.</li></ol>
<h3>Taking app orders</h3><ol><li>New orders appear at the top of the queue, oldest first, with the drink options (milk, sweetness, hot or iced) and the pick-up time.</li><li>Tap <b>Start brewing</b>, then <b>Ready · call code</b>. The customer's phone updates straight away.</li><li>When they collect, check the code on their phone and tap <b>Collected · add points</b>. On the live system the screen tells you what to charge ("take £8.40"), after any reward, free drink or gift balance.</li><li>Tapped the wrong order? Tap <b>Undo</b>. On the live system you'll be asked for a short reason.</li></ol>
<div class="box"><b>Prices come from the menu, not the phone.</b> If an order's total doesn't match the menu, the queue shows a <b>Price check</b> warning. Charge the menu price.</div>
</div><div>{fig('s-queue.png','The staff queue: one order waiting')}{fig('c-placed.png','What the customer sees after ordering','ph')}</div></div>'''))
P.append(page('3 · Daily routine', 'In-store points, web orders', f'''
<div class="cols"><div>
<h3>Points for till sales</h3><p>Customers who pay at the till can still collect points and stamps.</p><ol><li>Ask to see their Bija Card (Profile tab). They can flip it to show a QR code and their member code, e.g. <b class="k">BIJA-KJHV6</b>.</li><li>Open <b>Members</b>. Type the member code, the amount paid and the number of handcrafted drinks (for stamps).</li><li>Tick <b>Early bird</b> only when that offer applies <span class="tag">proposal to confirm</span>.</li><li>Tap <b>Add points</b>.</li></ol>
<p>Member codes are random and unique. If the code isn't found, check it letter by letter; never guess another member.</p>
<h3>Web shop and beans orders</h3><ol><li>Open <b>Web &amp; delivery</b>. "Orders to send" lists web and app beans orders with grind, address and email.</li><li>Post the bag with Royal Mail Tracked 48, then tap <b>Dispatched</b>. For click &amp; collect, tap <b>Collected</b> when handed over.</li><li>Points for beans land when you mark the order dispatched or collected.</li></ol>
</div><div>{fig('s-members.png','Members: add in-store spend by member code')}{fig('s-web.png','Web & delivery: orders to send and Beans Club deliveries')}</div></div>'''))
P.append(page('3 · Daily routine', 'Closing the day', f'''
<div class="cols"><div>
<p>Do this every evening in <b>Finance → Close the day</b>. It takes about two minutes.</p>
<ol><li><b>Takings.</b> Enter card and cash takings from the till's end-of-day report. Online beans orders are added for you. Enter tips separately: they are not sales.</li><li><b>Count the cash.</b> Count the drawer. The app compares it with float + cash takings + cash tips − cash paid out, and explains any difference in plain English.</li><li><b>Review and save.</b> Add a note if something was unusual (a refund, a short drawer) and save.</li></ol>
<p>Picking a date you've already closed opens it for editing.</p>
<h3>Bills and money out</h3><ul><li><b>Money out</b>: tap a category (coffee, milk, rent, wages…). Each has a sensible UK VAT rate you can change, and you can snap a receipt photo.</li><li>Tick <b>repeats every month</b> for rent and subscriptions; the app reminds you next month.</li><li><b>Bills</b>: add supplier invoices with a due date. Overdue bills show a number on the tab. Tap <b>Paid</b> when you pay and it becomes an expense.</li></ul>
</div><div>{fig('s-fin-today.png','Finance → Today: cash position and to-do list')}{fig('s-fin-close.png','Close the day, step 1')}</div></div>'''))
P.append(page('4 · Weekly', 'Beans, labels, insights', f'''
<div class="cols"><div>
<h3>Beans Club deliveries</h3><p><b>Web &amp; delivery → Beans Club deliveries</b> lists subscriptions due in the next 3 days, with bean, grind and address. Send them and tap the dispatch button; the next date moves on by itself. Customers can skip, pause or cancel up to 3 days before dispatch.</p>
<h3>QR labels for a new roast</h3><ol><li>Open <b>Menu → Print QR labels</b> (labels.html).</li><li>Choose the coffee, roast date and lot (and farm and harvest if Bija has published them).</li><li>Print on A4 sheets of 21 labels (63.5 × 38.1 mm, L7160 layout). Each QR opens that coffee's Bean passport: origin, freshness and journey.</li></ol>
<h3>Insights</h3><p>Best sellers, busy hours, ratings and how often members come back. Use it to plan staffing and stock.</p>
<h3>Cash flow</h3><p><b>Finance → Cash flow</b> shows the last 12 weeks and an 8-week forecast, with a plain-English warning if cash would go below £0.</p>
</div><div>{fig('w-labels.png','The QR label maker')}{fig('s-insights.png','Insights')}{fig('s-fin-flow.png','Cash flow and forecast')}</div></div>'''))
P.append(page('5 · Monthly and quarterly', 'Profit, VAT, accountant', f'''
<div class="cols"><div>
<h3>Profit and loss</h3><p><b>Finance → Profit &amp; loss</b>: sales without VAT, cost of sales, gross margin, overheads and net profit for the last 6 months, against your budget and break-even. Print the one-page monthly report for your records.</p>
<h3>VAT</h3><p>If Bija is VAT-registered (set it in Settings), <b>Finance → VAT</b> estimates the 9 boxes of the HMRC return for the quarter. If not registered, it tracks sales against the £90,000 registration threshold and warns you early.</p><div class="box">The VAT screen is an <b>estimate</b>. Returns must be filed through Making Tax Digital software or by your accountant.</div>
<h3>Export for the accountant</h3><p><b>Reports &amp; export</b> downloads a CSV with Date, Description, Reference, Amount, Account and Tax rate columns, ready for Xero or QuickBooks. It also shows liabilities: gift card balances, points and stamps owed, tips held for staff.</p>
<h3>Deadlines</h3><p><b>Finance → Deadlines</b> works out VAT, PAYE, Corporation Tax, CT600, Companies House accounts and the confirmation statement from your year end. It's guidance: check dates with your accountant.</p>
</div><div>{fig('s-fin-pl.png','Profit and loss')}{fig('s-fin-vat.png','VAT return estimate')}{fig('s-fin-dates.png','UK deadlines')}</div></div>'''))
P.append(page('6 · Loyalty', 'How customers earn', f'''
<div class="cols"><div>
<table><tr><th>What</th><th>Rule</th></tr>
<tr><td>Points</td><td>10 points for every £1, in the café, the app and the web shop. Points land when staff collect or dispatch the order.</td></tr>
<tr><td>Rewards</td><td>Any cake: 350 points. A 200 g bag of beans: 1,200 points.</td></tr>
<tr><td>Stamps</td><td>1 stamp per handcrafted drink handed over. The 10th drink is free, up to £5.50, on the priciest drink in the order. <span class="tag">proposal to confirm</span></td></tr>
<tr><td>Levels</td><td>Seed, then Sprout at 1,500 lifetime points (free extra shot or syrup), then Kopi Tree at 5,000 (first taste of new origins and event invites).</td></tr>
<tr><td>Bonuses</td><td>Welcome 100 · birthday 200 · Origins Passport 600 · Secret St James's 400 · challenges up to 200 a month.</td></tr>
<tr><td>Invites</td><td>300 points each, once the friend's first paid order of £3 or more is collected and staff confirm it in <b>Members → Invites to confirm</b>. <span class="tag">proposal to confirm</span></td></tr>
<tr><td>Offers</td><td>Own cup 25p off · students 10% off · early-bird double points · Beans Club 10% off beans. Applied by staff at the till. <span class="tag">proposal to confirm</span></td></tr>
<tr><td>Expiry</td><td>"Points expire after 12 months without a visit" is shown to customers but not yet enforced. <span class="tag">proposal to confirm</span></td></tr></table>
<h3>What staff can and can't change</h3><ul><li>Staff add points only through real sales: collected orders and in-store spend.</li><li>Staff can undo a mistaken collection; the history is kept.</li><li>Manual corrections (adding or removing points, stamps or gift balance) are <b>owner only</b> and need the owner's own login with two-factor sign-in on the live system. Every correction is logged with a reason.</li></ul>
</div><div>{fig('c-profile.png','The Bija Card with points and stamps','ph sm')}{fig('c-stamps.png','The stamp drawer','ph sm')}</div></div>'''))
P.append(page('7 · Gift cards', 'Selling and redeeming', f'''
<div class="cols"><div>
<h3>Selling a gift card</h3><ol><li>The customer chooses an amount (£5 to £200), a design and a message in the app's Gift cards page.</li><li>They pay at the bar. Open <b>Gift cards → Take payment</b>, find their card and tap <b>Paid · activate card</b>, entering the amount actually taken.</li><li>The gift code is created at that moment and <b>shown once</b>. The buyer sees it in their app to pass on.</li></ol>
<h3>Redeeming</h3><ol><li>The recipient types the code into their app.</li><li>On the live system the balance is added straight away; each code works once only. In demo mode the code appears under <b>Codes to confirm</b> for staff to approve.</li><li>At checkout they can pay with their gift balance. The queue shows how much was paid by gift card and what to take.</li></ol>
<div class="box">Gift balances are money Bija owes. They appear as a liability in <b>Finance → Reports &amp; export</b>. Ask your accountant how to treat VAT on gift cards.</div>
</div><div>{fig('s-gifts.png','Staff Gift cards tab')}</div></div>'''))
P.append(page('8 · Security and privacy', 'Keeping it safe', f'''
<div class="cols"><div>
<h3>The staff PIN</h3><ul><li>6 digits. 5 wrong tries lock the PIN pad for 60 seconds; the live server also limits attempts.</li><li>Staff mode signs out after 30 minutes without use, and when you tap <b>Exit</b>.</li><li>Only a scrambled (hashed) form of the PIN is stored, never the PIN itself.</li><li>The real protection is the database rules: customers can only ever read and write their own card, and only staff can change orders, points and money.</li></ul>
<h3>Forgotten PIN (owner only)</h3><ol><li>Sign in at supabase.com, open the <b>bija</b> project, then <b>SQL Editor</b>.</li><li>Paste the reset query from <b>docs/backend/reset-staff-pin.md</b>, replacing 123456 with the new 6-digit PIN.</li><li>Press <b>Run</b>; it should say "1 row affected".</li><li>Delete the query from the editor and its history, so the PIN isn't left on screen.</li><li>Tell the team the new PIN in person, not by message.</li></ol><p>It stores only a scrambled form of the new PIN, <b>signs out every staff device</b> and <b>clears any lockout</b>. The demo PIN resets by clearing the browser's site data.</p>
<h3>If a tablet or phone is lost</h3><ol><li>Change the staff PIN from another device (this signs out other staff sessions on the live system).</li><li>Review <b>Insights</b> and the gift card list for anything unusual.</li><li>If customer data may have been exposed, follow docs/ops/incident-response.md; serious breaches must be reported to the ICO within 72 hours.</li></ol>
</div><div>{fig('s-pin.png','The staff PIN pad')}<h3>Customer data requests (UK GDPR)</h3><ul><li>Customers can ask for a copy of their data, a correction or deletion. Reply within <b>one month</b>.</li><li>Delete their customer record; keep money records only as long as accounting requires.</li></ul>
<h3>How long we keep things</h3><ul><li>Orders, loyalty and subscriptions: up to 2 years after the last visit or order.</li><li>Sales, gift card and finance records: 6 years (HMRC).</li><li>Newsletter email: until they unsubscribe.</li></ul>
</div></div>'''))
P.append(page('9 · Troubleshooting', 'When something goes wrong', '''
<table><tr><th style="width:30%">Problem</th><th>What to do</th></tr>
<tr><td><b>App orders aren't arriving</b></td><td>Check <b>Queue</b> says app ordering is <b>On</b> (not paused). Refresh the page. Check the tablet's Wi-Fi. On the live system check the Supabase project is running (dashboard). If still stuck, pause app ordering and take orders at the till; follow docs/ops/runbook.md.</td></tr>
<tr><td><b>The app says it's offline</b></td><td>A banner appears when the phone has no signal. Customers can still see their card; orders send when the signal returns. For the bar, switch to mobile data or take orders at the till.</td></tr>
<tr><td><b>A customer's points look wrong</b></td><td>Points only land when an order is <b>collected</b> or in-store spend is added. Check the order isn't still Ready. Check the member code you entered. Corrections are owner only (two-factor sign-in on live), with a reason.</td></tr>
<tr><td><b>A free drink isn't offered</b></td><td>The stamp card needs 9 stamps before the 10th drink is free, and stamps come from drinks handed over, not cakes or beans.</td></tr>
<tr><td><b>A customer can't scan a bag QR</b></td><td>On iPhone, use the Camera app and tap the link. In the app, <b>Scan coffee</b> works on Android and in the native app. The Bean passport also opens by typing the link from the label.</td></tr>
<tr><td><b>A gift code doesn't work</b></td><td>Codes work once, only after the card was activated at payment. Check <b>Gift cards</b> for the card's status. Never type a code for a customer you can't verify.</td></tr>
<tr><td><b>Forgot the staff PIN</b></td><td>If anyone still knows it, change it in <b>Menu → Change staff PIN</b>. If nobody does, the owner resets it in Supabase (steps on the Security page, or docs/backend/reset-staff-pin.md). In the demo, clear the browser's site data: the PIN goes back to 111111.</td></tr>
<tr><td><b>Price check warning in the queue</b></td><td>The order's total didn't match the menu. Charge the menu price shown.</td></tr></table>'''))
P.append(page('10 · Decisions', 'Still open for Bija', '''
<p>These came from every team tonight. Each has a recommended default; items marked <b>blocks launch</b> must be answered before the app and shop go public. The full list (45 items) is in docs/bizdev/owner-decisions.md.</p>
<table><tr><th>Decision</th><th>Recommended default</th></tr>
<tr><td>Who roasts the coffee <span class="tag">blocks launch</span></td><td>Confirm in writing. The site says Bija's baristas roast; a public Redber case study suggests Redber roasts own-brand bags. Kindred Forest sources the green coffee.</td></tr>
<tr><td>Prices and delivery <span class="tag">blocks launch</span></td><td>Beans £12; delivery £3.95, free on £30 or more. Beans Club 10% off, free posting from 2 bags or £2.50 for one.</td></tr>
<tr><td>Points and stamps <span class="tag">blocks launch</span></td><td>Keep stamps (10th drink free) and points for cake and beans. A second analysis suggests points only; see docs/bizdev/second-opinion.</td></tr>
<tr><td>Invites and offers</td><td>300 each after a £3+ first order; own cup keep; students off-peak; early bird drop or move to quiet hours.</td></tr>
<tr><td>Gift subscription</td><td>£36 collected, £42 posted.</td></tr>
<tr><td>Payments and till <span class="tag">blocks launch</span></td><td>Tell us the current till; Square if it can switch, otherwise Stripe for the app.</td></tr>
<tr><td>Web address <span class="tag">blocks launch</span></td><td>bijacoffee.co.uk; switch on search indexing on launch day.</td></tr>
<tr><td>Accountant and solicitor <span class="tag">blocks launch</span></td><td>Book both this week (VAT, gift cards, loyalty and subscription terms).</td></tr>
<tr><td>Postcode and contact email</td><td>Confirm SW1Y 4AH vs SW1Y 4SB, and the real email address.</td></tr>
<tr><td>Wallet and stores</td><td>Apple Developer ($99/yr), Google Play ($25), Google Wallet issuer account.</td></tr>
<tr><td>Owner two-factor login</td><td>Set up before manual corrections are needed.</td></tr></table>
<div class="box dark"><div class="kick">Contacts</div><p style="margin:0">Bija Coffee Limited · 2a St James's Market, London SW1Y 4AH · +44 20 4603 3086 · info@bijalondon.co.uk (to confirm) · Supabase project "bija" (London) · Code: github.com/rfim/bija-coffee</p></div>'''))
open(os.path.join(H,'owner.html'),'w').write(f'<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>Bija owner handbook</title><link rel="stylesheet" href="{FONT}"><style>{CSS}</style></head><body>{"".join(P)}</body></html>')

# Barista quick guide: 2 pages
Q1 = f'''<section class="pg"><div class="hdr"><span>{MARK}Bija · Barista quick guide</span><span>Keep behind the bar</span></div><div style="height:6mm"></div>
<h2 style="font-size:30pt">Behind the bar</h2>
<div class="c3">
<div class="box dark"><div class="kick">1 · Staff mode</div><ol style="margin:0"><li>Hold the round <b>Order</b> button for <b>3 seconds</b> until the ring closes.</li><li>Enter the 6-digit staff PIN.</li><li>Tap <b>Exit</b> when you leave the tablet. It signs out by itself after 30 minutes.</li></ol></div>
<div class="box"><div class="kick">2 · App orders</div><ol style="margin:0"><li>New order → <b>Start brewing</b>.</li><li>Drink ready → <b>Ready · call code</b>.</li><li>Customer shows the code → <b>Collected · add points</b>.</li><li>Charge what the screen says. Price check warning? Charge the menu price.</li></ol></div>
<div class="box"><div class="kick">3 · Till sales</div><ol style="margin:0"><li>Ask for their Bija Card (Profile tab) and member code, e.g. BIJA-KJHV6.</li><li><b>Members</b>: code, amount paid, number of drinks.</li><li>Tap <b>Add points</b>.</li></ol></div>
</div>
<div class="cols">{fig('s-queue.png','The queue')}{fig('s-members.png','Members: add in-store spend')}</div>
<div class="cols"><div class="box"><div class="kick">Free drink</div><p style="margin:0">Every handcrafted drink is a stamp. At 9 stamps the <b>10th drink is free</b>, up to £5.50, on the priciest drink. The app applies it; you don't need to work it out.</p></div>
<div class="box"><div class="kick">Wrong button?</div><p style="margin:0">Tap <b>Undo</b> on the order. Never add points twice to fix a mistake: tell the owner.</p></div></div></section>'''
Q2 = f'''<section class="pg"><div class="hdr"><span>{MARK}Bija · Barista quick guide</span><span>Page 2</span></div><div style="height:6mm"></div>
<div class="cols"><div>
<h3>Gift cards</h3><ol><li>Customer chooses the card in the app and pays you.</li><li><b>Gift cards → Take payment</b> → <b>Paid · activate card</b>, entering the amount taken.</li><li>The code shows <b>once</b>; the buyer sees it in their app.</li><li>Redeeming: the customer types the code in their app. Each code works once.</li></ol>
<h3>Beans orders</h3><ol><li><b>Web &amp; delivery</b> → Orders to send.</li><li>Post with Royal Mail Tracked 48 → <b>Dispatched</b>.</li><li>Click &amp; collect → <b>Collected</b> when handed over.</li></ol>
<h3>Offers at the till <span class="tag">proposal to confirm</span></h3><ul><li>Own cup: 25p off any hot drink.</li><li>Students: 10% off with a valid student card.</li><li>Early bird: tick double points, Mon–Fri before 9am.</li></ul>
</div><div>
<h3>Busy rush?</h3><p>In <b>Queue</b>, tap <b>Pause orders</b>. Customers see ordering is paused. Turn it back on when you've caught up.</p>
<h3>Allergies</h3><p>Show customers the allergen information; never guess. Same jug and steam wand for all milks; cakes may contain nuts, milk, gluten and egg.</p>
<div class="box dark"><div class="kick">Call the owner when</div><ul style="margin:0"><li>Points, stamps or a gift balance look wrong.</li><li>A gift code is refused but the customer insists it's paid.</li><li>App orders stop arriving for more than 10 minutes.</li><li>A tablet or phone with staff mode is lost.</li><li>Someone asks for their data, or to delete their account.</li></ul></div>
<div class="box"><div class="kick">Never</div><ul style="margin:0"><li>Share the PIN or write it down here.</li><li>Type a gift code or member code for someone else.</li><li>Add points without a real sale.</li></ul></div>
</div></div></section>'''
open(os.path.join(H,'barista.html'),'w').write(f'<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>Bija barista quick guide</title><link rel="stylesheet" href="{FONT}"><style>{CSS}</style></head><body>{Q1}{Q2}</body></html>')
print('built')
