"""Builds docs/bizdev/loyalty-model.xlsx (Bija loyalty and offers economics).

Run:  python3 docs/bizdev/build_loyalty_model.py
Then recalculate (LibreOffice) so the cached values are filled in.
Every number on the Assumptions tab is an input; every other number is a formula.
"""
from pathlib import Path

from openpyxl import Workbook
from openpyxl.comments import Comment
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side

OUT = Path(__file__).with_name('loyalty-model.xlsx')
FONT = 'Arial'
BLUE = Font(name=FONT, color='0000FF')
BLACK = Font(name=FONT)
BOLD = Font(name=FONT, bold=True)
GREEN = Font(name=FONT, color='008000')
TITLE = Font(name=FONT, bold=True, size=14)
HEAD = Font(name=FONT, bold=True, color='FFFFFF')
HEAD_FILL = PatternFill('solid', fgColor='0B0B0B')
YELLOW = PatternFill('solid', fgColor='FFFF00')
GREY = PatternFill('solid', fgColor='F2F2F2')
TOP = Border(top=Side(style='thin'))
WRAP = Alignment(wrap_text=True, vertical='top')

GBP = '£#,##0;(£#,##0);-'
GBP2 = '£#,##0.00;(£#,##0.00);-'
PCT = '0.0%;(0.0%);-'
NUM = '#,##0;(#,##0);-'
NUM1 = '#,##0.0;(#,##0.0);-'
P4 = '0.000"p";(0.000"p");-'

wb = Workbook()

# ---------------------------------------------------------------- Assumptions
A = wb.active
A.title = 'Assumptions'
A['A1'] = 'Bija loyalty and offers model: assumptions'
A['A1'].font = TITLE
A['A2'] = ('Blue on yellow = input you can change. Everything on the other tabs is a formula. '
           '"ASSUMPTION" = our estimate with no Bija data behind it; replace with till and app data after 8 weeks. '
           'Costs are at cost price (ingredients, packaging, postage, fees), not retail value.')
A['A2'].font = Font(name=FONT, italic=True, color='595959')
A.merge_cells('A2:D2')
A['A2'].alignment = WRAP
A.row_dimensions[2].height = 45
for c, h in zip('ABCD', ['Input', 'Value', 'Unit', 'Source or reasoning']):
    A[f'{c}4'] = h
    A[f'{c}4'].font = HEAD
    A[f'{c}4'].fill = HEAD_FILL

REF = {}
row = 5


def section(name):
    global row
    row += 1
    A[f'A{row}'] = name
    A[f'A{row}'].font = BOLD
    A[f'A{row}'].fill = GREY
    for c in 'BCD':
        A[f'{c}{row}'].fill = GREY
    row += 1


def inp(key, label, value, unit, fmt, note):
    global row
    A[f'A{row}'] = label
    A[f'B{row}'] = value
    A[f'B{row}'].font = BLUE
    A[f'B{row}'].fill = YELLOW
    A[f'B{row}'].number_format = fmt
    A[f'C{row}'] = unit
    A[f'D{row}'] = note
    for c in 'ACD':
        A[f'{c}{row}'].font = BLACK
    A[f'D{row}'].alignment = WRAP
    REF[key] = f"Assumptions!$B${row}"
    row += 1


section('The café (shared with docs/finance/bija-unit-economics.xlsx where possible)')
inp('members', 'Members modelled', 1000, 'members', NUM,
    'Every scheme is costed per 1,000 Bija Card members a year. Marketing targets 800 members by day 90 (docs/marketing/90-day-calendar.md).')
inp('visits_pm', 'Visits per member per month (average across active and lapsed)', 2.0, 'visits', NUM1,
    'ASSUMPTION, cautious. 1,000 members × 24 visits = 24,000 transactions a year, about a third of a 200-a-day café, in line with marketing\'s 30% "on a Bija Card" target.')
inp('atv', 'Average transaction value, incl. VAT', 6.23, '£', GBP2,
    'UK café benchmark used in the Sprint 2 brief and the finance model (Base). Replace with the till.')
inp('std_share', 'Share of takings that is standard-rated', 0.85, '%', PCT,
    'Finance model. Hot drinks and eat-in 20%; beans and cold takeaway food usually zero-rated. Confirm with the accountant.')
inp('vat', 'VAT standard rate', 0.20, '%', PCT, 'HMRC standard rate.')
inp('gm', 'Gross margin on net sales', 0.68, '%', PCT,
    'Finance model Base (and the app\'s Finance default). ASSUMPTION until supplier invoices are in.')
inp('card_fee', 'Card fee at the till', 0.0175, '% of takings', PCT,
    'Square in person 1.75% (docs/fullstack/pos-integration.md). Check the statement.')
inp('staff_rate', 'Loaded staff cost', 17.50, '£/hour', GBP2, 'Finance model ASSUMPTION (pay + NI, pension, holiday).')

section('Unit costs at cost price')
inp('drinks_per_visit', 'Handcrafted drinks per member visit', 1.0, 'drinks', NUM1,
    'ASSUMPTION. Some visits are cake or beans only, some are two drinks.')
inp('reward_drink_price', 'Menu price of a drink chosen as a free reward', 4.80, '£', GBP2,
    'ASSUMPTION. Members pick dearer drinks when free (kopi susu aren, filter £4.50; iced and specials more). Menu prices in app.html.')
inp('reward_drink_cost', 'Cost of a reward drink (coffee, milk, syrup, cup and lid)', 1.30, '£', GBP2,
    'ASSUMPTION: about 32% of the £4.00 net price, the finance model\'s 68% margin. Replace with the recipe costing.')
inp('cake_cost', 'Cost of a cake slice', 1.00, '£', GBP2,
    'ASSUMPTION: cakes sell at £3.00; about a third food cost.')
inp('bag_price', 'Retail price, 200 g bag', 12.00, '£', GBP2, 'Shop price (shop.html, site-shop.js).')
inp('bag_cost', 'Cost of a 200 g bag incl. retail bag', 5.40, '£', GBP2,
    'Brief: 45% of £12. Cautious: Bija roasts its own green coffee, so the true cost is probably lower. Get the real figure.')
inp('shot_cost', 'Cost of an extra shot or syrup pump', 0.18, '£', GBP2,
    'ASSUMPTION: about 9 g of coffee at café roast cost, or one syrup pump.')
inp('cup_cost', 'Takeaway cup and lid saved when a customer brings a cup', 0.11, '£', GBP2,
    'ASSUMPTION: typical 8–12 oz compostable cup and lid at small-business volumes. Use the supplier invoice.')

section('Points (10 per £1; cake 350, drink 400, bag 1,200)')
inp('pts_per_gbp', 'Points per £1', 10, 'points', NUM, 'Proposed scheme; as built in app.html (PTS = 10).')
inp('pts_cake', 'Points for a cake', 350, 'points', NUM, 'Proposed scheme (app.html REWARDS).')
inp('pts_drink', 'Points for a drink', 400, 'points', NUM, 'Proposed scheme (app.html REWARDS).')
inp('pts_bag', 'Points for a 200 g bag', 1200, 'points', NUM, 'Proposed scheme (app.html REWARDS).')
inp('mix_cake', 'Share of redeemed points spent on cake', 0.30, '%', PCT, 'ASSUMPTION.')
inp('mix_drink', 'Share of redeemed points spent on drinks', 0.60, '%', PCT, 'ASSUMPTION.')
inp('mix_bag', 'Share of redeemed points spent on beans', 0.10, '%', PCT, 'ASSUMPTION. Must add to 100% with the two above (check on the Calc tab).')
inp('bonus_pts', 'Bonus points per member per year (welcome, birthday, challenges, passport, trail)', 500, 'points', NUM,
    'ASSUMPTION: welcome 100 + birthday 200 + about 100 from challenges + about 100 from Passport (600) and Secret trail (400) completed by ~10%. The 200-a-month challenge cap limits the worst case to 2,400.')
inp('brk_pts', 'Points breakage (issued but never redeemed)', 0.25, '%', PCT,
    'Retail programmes are usually quoted at 20–30% (https://www.leat.com/resources/insights/loyalty-program-breakage ; https://loyalty360.org/content-gallery/daily-news/rewards-breakage-boon-or-bane-the-role-of-technology-in-optimizing-breakage). Vendor sources; we take the cautious middle. Lower breakage = higher cost.')

section('Stamps (1 per handcrafted drink, 10th free up to £5.50)')
inp('stamp_paid', 'Paid drinks per free drink', 9, 'drinks', NUM,
    'Read as "buy 9, the 10th is free", the costlier reading. If it means 10 paid then 1 free, change to 10.')
inp('stamp_cap', 'Cap on the free drink', 5.50, '£', GBP2, 'Proposed scheme.')
inp('brk_stamp', 'Stamp breakage (stamps on cards never completed)', 0.35, '%', PCT,
    'ASSUMPTION. One vendor example: ~22% of buy-9-get-1 cards completed within 8 weeks (https://bonusqr.com/article/loyalty-programs-that-actually-drive-repeat-visits). Digital cards that never expire complete more often, so we assume only 35% of stamps are wasted.')

section('Tiers (Seed, Sprout 1,500, Kopi Tree 5,000: perks, not multipliers)')
inp('share_sprout', 'Members at Sprout at any time', 0.25, '%', PCT,
    'ASSUMPTION. 1,500 lifetime points is about £150 of spend: a regular reaches it in 2–3 months, an average member in about 9.')
inp('share_tree', 'Members at Kopi Tree at any time', 0.05, '%', PCT, 'ASSUMPTION. 5,000 points = about £500 of spend.')
inp('sprout_visits_pm', 'Visits per month by a Sprout or Kopi Tree member', 6, 'visits', NUM, 'ASSUMPTION: these are the regulars.')
inp('perk_use', 'Share of their drinks that take the free extra shot or syrup', 0.25, '%', PCT, 'ASSUMPTION.')
inp('tree_events', 'Kopi Tree events a year', 4, 'events', NUM, 'ASSUMPTION: one a quarter, before opening or after close.')
inp('tree_event_cost', 'Cost per event (coffee, cake, 2 staff × 2 h)', 150, '£', GBP, 'ASSUMPTION.')
inp('tree_tastings', 'New-origin tastings per Kopi Tree member a year', 4, 'tastings', NUM, 'ASSUMPTION.')
inp('tasting_cost', 'Cost per tasting', 0.50, '£', GBP2, 'ASSUMPTION: a small filter sample.')

section('Referral (+300 points each, staff-confirmed)')
inp('ref_rate', 'Successful referrals per member per year', 0.10, 'referrals', NUM1,
    'ASSUMPTION: 1 in 10 members brings one new member a year.')
inp('ref_pts', 'Points to each side', 300, 'points', NUM, 'Proposed scheme (app.html REFER = 300).')
inp('ref_minutes', 'Staff minutes to confirm a referral', 1, 'minutes', NUM, 'ASSUMPTION.')

section('Offers')
inp('takeaway_share', 'Share of drinks taken away', 0.60, '%', PCT, 'ASSUMPTION for an office location.')
inp('cup_uptake', 'Share of takeaway drinks in a customer\'s own cup', 0.03, '%', PCT,
    'Costa reported ~1% take-up of its 25p discount in 2017; a Starbucks London trial moved own-cup use from 2.2% to 5.9% (https://www.huffingtonpost.co.uk/entry/have-we-taken-to-using-reusable-coffee-cups_uk_5b278825e4b0f9178a9eefb7 ; https://uk.finance.yahoo.com/news/starbucks-introduces-apos-latte-levy-103249981.html). Old data; 3% is a middle guess.')
inp('cup_disc', 'Own-cup discount', 0.25, '£', GBP2, 'Proposed scheme. Same as Costa and Starbucks; Pret moved to 50p in 2018 (https://bakeryinfo.co.uk/foodservice/paul-uk-on-par-with-pret-for-reusable-cup-discount/624819.article).')
inp('student_share', 'Share of member visits by students', 0.03, '%', PCT,
    'ASSUMPTION. St James\'s is offices and visitors; BizDev ranked the student offer "not now" (docs/bizdev/priorities.md).')
inp('student_disc', 'Student discount', 0.10, '%', PCT, 'Proposed scheme.')
inp('early_share', 'Share of member visits on weekdays before 9am', 0.25, '%', PCT,
    'ASSUMPTION. The shop opens at 8am on weekdays (app.html HOURS), so this is the 8–9am commuter hour, already the busiest.')

section('Beans Club (10% off every 200 g bag, free delivery, every 2, 3 or 4 weeks)')
inp('club_share', 'Members who subscribe', 0.08, '%', PCT, 'ASSUMPTION: 80 subscribers per 1,000 members; BizDev forecast ~112 by May 2027.')
inp('club_bags_pm', 'Bags per subscriber per month', 1.5, 'bags', NUM1,
    'ASSUMPTION. Every 2 weeks = 2.17, 3 weeks = 1.45, 4 weeks = 1.08 a month; a mix of 30/30/40 gives about 1.5.')
inp('club_disc', 'Subscription discount', 0.10, '%', PCT, 'Proposed scheme: £10.80 instead of £12.')
inp('counter_bags_pm', 'Bags a subscriber would buy anyway at the counter, per month', 0.5, 'bags', NUM1,
    'ASSUMPTION: the subscribers are mostly existing bean buyers. This is the volume the club cannibalises.')
inp('mailer', 'Letterbox mailer and insert, 1 bag', 0.60, '£', GBP2, 'BizDev bean-subscription.md (quote needed).')
inp('post_ll', 'Royal Mail Tracked 48 Large Letter, online', 2.90, '£', GBP2,
    'Royal Mail online prices from 5 Oct 2026 (https://www.royalmail.com/sites/royalmail.com/files/2026-10/online-price-guide-october-2026-v1.pdf), via docs/bizdev/bean-subscription.md. Only if the bag passes the 2.5 cm test.')
inp('box_sp', 'Small-parcel box, 2–3 bags', 0.80, '£', GBP2, 'BizDev bean-subscription.md (assumption).')
inp('post_sp', 'Royal Mail Tracked 48 Small Parcel, online', 3.75, '£', GBP2, 'Same Royal Mail source.')
inp('online_pct', 'Online card fee', 0.015, '% of order', PCT, 'Stripe UK cards, docs/mobile/payments-plan.md (unconfirmed there).')
inp('online_fixed', 'Online card fee, fixed part', 0.20, '£', GBP2, 'Same.')
inp('billing_pct', 'Subscription billing fee', 0.007, '% of order', PCT, 'Stripe Billing 0.7%, docs/mobile/payments-plan.md.')
inp('collect_share', 'Recommended version: share of subscribers who collect in store', 0.50, '%', PCT,
    'ASSUMPTION. BizDev assumed 60% collect (40% post) for St James\'s office workers.')
inp('single_post_charge', 'Recommended version: delivery charge on a 1-bag posted delivery', 2.50, '£', GBP2,
    'Proposal: free delivery from 2 bags per delivery (or collect in store); £2.50 on a single bag.')

section('Delivery (£3.95, free over £30)')
inp('delivery_charge', 'Delivery charge', 3.95, '£', GBP2, 'Proposed (shop.html, delivery.html).')
inp('free_over', 'Free delivery threshold', 30, '£', GBP, 'Proposed.')
inp('online_orders', 'One-off online orders per member a year', 0.20, 'orders', NUM1, 'ASSUMPTION: 1 in 5 members orders once a year.')
inp('share_over', 'Share of those orders at £30 or more', 0.40, '%', PCT,
    'ASSUMPTION. The £33 Discovery set alone qualifies, as do 3 bags (£36).')
inp('bags_over', 'Bags in an order over £30', 3, 'bags', NUM, 'ASSUMPTION.')

section('Gifting (gift subscription £36 for 3 months; Discovery set £33)')
inp('gift_price', 'Gift subscription price as proposed (3 bags, delivery included)', 36, '£', GBP2, 'Proposed (site-shop.js, subscribe.html).')
inp('gift_price_adj', 'Recommended gift subscription price, posted', 42, '£', GBP2,
    'Proposal. BizDev had £36 collect / £43.50 posted (bean-subscription.md).')
inp('gift_card_cost', 'Gift card, envelope and insert', 0.30, '£', GBP2, 'ASSUMPTION.')
inp('gifts', 'Gift subscriptions sold per 1,000 members a year', 50, 'gifts', NUM, 'ASSUMPTION, mostly at Christmas.')
inp('gift_convert', 'Recipients who become paying Beans Club members', 0.20, '%', PCT, 'BizDev assumption (bean-subscription.md).')
inp('club_months', 'Average months a converted subscriber stays', 8, 'months', NUM,
    'ASSUMPTION: about 1 ÷ 12% monthly churn. UK and US blogs put coffee subscription churn at 4–10% a month (https://eightx.co/blog/coffee-subscription-churn-rate-benchmark); cautious end.')
inp('disc_price', 'Discovery set price (3 × 200 g)', 33, '£', GBP2, 'Proposed (site-shop.js).')
inp('discovery_sets', 'Discovery sets sold per 1,000 members a year', 40, 'sets', NUM, 'ASSUMPTION.')
inp('disc_post_share', 'Share of Discovery sets posted', 0.60, '%', PCT, 'ASSUMPTION.')

A.column_dimensions['A'].width = 62
A.column_dimensions['B'].width = 12
A.column_dimensions['C'].width = 13
A.column_dimensions['D'].width = 110
A.freeze_panes = 'A5'


def R(k):
    return REF[k]


# ---------------------------------------------------------------- Calc
C = wb.create_sheet('Calc')
C['A1'] = 'Workings (formulas only)'
C['A1'].font = TITLE
C['A2'] = 'Per 1,000 members a year unless stated. Green = pulled from Assumptions.'
C['A2'].font = Font(name=FONT, italic=True, color='595959')
for c, h in zip('ABC', ['Line', 'Value', 'How']):
    C[f'{c}4'] = h
    C[f'{c}4'].font = HEAD
    C[f'{c}4'].fill = HEAD_FILL
CR = {}
crow = 5


def csec(name):
    global crow
    crow += 1
    C[f'A{crow}'] = name
    C[f'A{crow}'].font = BOLD
    C[f'A{crow}'].fill = GREY
    C[f'B{crow}'].fill = GREY
    C[f'C{crow}'].fill = GREY
    crow += 1


def calc(key, label, formula, fmt, how='', bold=False):
    global crow
    C[f'A{crow}'] = label
    C[f'B{crow}'] = formula
    C[f'B{crow}'].number_format = fmt
    C[f'C{crow}'] = how
    C[f'A{crow}'].font = BOLD if bold else BLACK
    C[f'B{crow}'].font = BOLD if bold else BLACK
    C[f'C{crow}'].font = Font(name=FONT, color='595959')
    CR[key] = f'Calc!$B${crow}'
    crow += 1


def K(k):
    return CR[k]


csec('Base: what a member visit is worth')
calc('visits_pa', 'Visits per member per year', f'={R("visits_pm")}*12', NUM1)
calc('net_visit', 'Net sales per visit (ex VAT)', f'={R("atv")}*(1-{R("std_share")}*{R("vat")}/(1+{R("vat")}))', GBP2,
     'ATV less the VAT inside the standard-rated share')
calc('contrib_visit', 'Contribution per visit', f'={K("net_visit")}*{R("gm")}-{R("atv")}*{R("card_fee")}', GBP2,
     'net × gross margin − card fee', bold=True)
calc('net_member', 'Net sales per member per year', f'={K("visits_pa")}*{K("net_visit")}', GBP2)
calc('net_1000', 'Net sales per 1,000 members per year', f'={K("net_member")}*{R("members")}', GBP)
calc('visits_1000', 'Visits per 1,000 members per year', f'={K("visits_pa")}*{R("members")}', NUM)
calc('mix_check', 'Check: redemption mix adds to 100%', f'={R("mix_cake")}+{R("mix_drink")}+{R("mix_bag")}', PCT, 'must read 100.0%')
calc('cost_point', 'Cost of one redeemed point (pence)',
     f'=100*({R("mix_cake")}*{R("cake_cost")}/{R("pts_cake")}+{R("mix_drink")}*{R("reward_drink_cost")}/{R("pts_drink")}+{R("mix_bag")}*{R("bag_cost")}/{R("pts_bag")})',
     P4, 'mix-weighted cost of each reward ÷ its points', bold=True)
calc('retail_point', 'Retail value of one redeemed point (pence)',
     f'=100*({R("mix_cake")}*3/{R("pts_cake")}+{R("mix_drink")}*{R("reward_drink_price")}/{R("pts_drink")}+{R("mix_bag")}*{R("bag_price")}/{R("pts_bag")})',
     P4, 'cake £3.00 menu price')
calc('online_bag_contrib', 'Contribution of an extra bag in an online order',
     f'={R("bag_price")}-{R("bag_cost")}-{R("bag_price")}*{R("online_pct")}', GBP2)

csec('1. Points')
calc('pts_base', 'Base points per member per year', f'={K("visits_pa")}*{R("atv")}*{R("pts_per_gbp")}', NUM)
calc('pts_total', 'Total points issued per member (base + bonuses)', f'={K("pts_base")}+{R("bonus_pts")}', NUM)
calc('pts_cost', 'Points: cost per 1,000 members', f'={K("pts_total")}*(1-{R("brk_pts")})*{K("cost_point")}/100*{R("members")}', GBP, bold=True)
calc('pts_cost_nobrk', 'Points: cost with zero breakage', f'={K("pts_total")}*{K("cost_point")}/100*{R("members")}', GBP)
calc('pts_retail', 'Points: retail value given away', f'={K("pts_total")}*(1-{R("brk_pts")})*{K("retail_point")}/100*{R("members")}', GBP)

csec('2. Stamps (if run alongside points)')
calc('stamps', 'Stamps per member per year', f'={K("visits_pa")}*{R("drinks_per_visit")}', NUM1)
calc('stamp_free', 'Free drinks per member per year', f'={K("stamps")}/{R("stamp_paid")}*(1-{R("brk_stamp")})', NUM1)
calc('stamp_cost', 'Stamps: cost per 1,000 members', f'={K("stamp_free")}*{R("reward_drink_cost")}*{R("members")}', GBP, bold=True)
calc('stamp_cost_nobrk', 'Stamps: cost with zero breakage', f'={K("stamps")}/{R("stamp_paid")}*{R("reward_drink_cost")}*{R("members")}', GBP)
calc('stamp_retail', 'Stamps: retail value given away', f'={K("stamp_free")}*MIN({R("stamp_cap")},{R("reward_drink_price")})*{R("members")}', GBP)
calc('stamp_giveback', 'Stamps + points together: retail value returned per £ of member net sales',
     f'=({K("stamp_retail")}+{K("pts_retail")})/{K("net_1000")}', PCT, 'what a member sees as their "discount"')

csec('3. Tiers')
calc('sprout_cost', 'Sprout and Kopi Tree: free shot or syrup',
     f'={R("members")}*({R("share_sprout")}+{R("share_tree")})*{R("sprout_visits_pm")}*12*{R("drinks_per_visit")}*{R("perk_use")}*{R("shot_cost")}', GBP)
calc('tree_cost', 'Kopi Tree: events and tastings',
     f'={R("tree_events")}*{R("tree_event_cost")}+{R("members")}*{R("share_tree")}*{R("tree_tastings")}*{R("tasting_cost")}', GBP)
calc('tier_cost', 'Tiers: cost per 1,000 members', f'={K("sprout_cost")}+{K("tree_cost")}', GBP, bold=True)
calc('tier_members', 'Members in Sprout or Kopi Tree', f'={R("members")}*({R("share_sprout")}+{R("share_tree")})', NUM)
calc('tier_visits', 'Their visits a year', f'={K("tier_members")}*{R("sprout_visits_pm")}*12', NUM)

csec('4. Referral')
calc('refs', 'Successful referrals per 1,000 members', f'={R("members")}*{R("ref_rate")}', NUM)
calc('ref_unit', 'Cost per referral (both sides, after breakage, plus staff time)',
     f'=2*{R("ref_pts")}*(1-{R("brk_pts")})*{K("cost_point")}/100+{R("ref_minutes")}/60*{R("staff_rate")}', GBP2)
calc('ref_cost', 'Referral: cost per 1,000 members', f'={K("refs")}*{K("ref_unit")}', GBP, bold=True)
calc('ref_be', 'Visits a referred friend must make to pay it back', f'={K("ref_unit")}/{K("contrib_visit")}', NUM1)

csec('5. Offers')
calc('cup_uses', 'Own-cup uses per 1,000 members', f'={K("visits_1000")}*{R("drinks_per_visit")}*{R("takeaway_share")}*{R("cup_uptake")}', NUM)
calc('cup_unit', 'Net cost per own-cup use (discount ex VAT less cup and lid saved)', f'={R("cup_disc")}/(1+{R("vat")})-{R("cup_cost")}', GBP2)
calc('cup_cost_total', 'Own cup: cost per 1,000 members', f'={K("cup_uses")}*{K("cup_unit")}', GBP, bold=True)
calc('stu_visits', 'Student visits per 1,000 members', f'={K("visits_1000")}*{R("student_share")}', NUM)
calc('stu_cost', 'Students: cost per 1,000 members', f'={K("stu_visits")}*{K("net_visit")}*{R("student_disc")}', GBP, bold=True)
calc('stu_contrib', 'Contribution of a discounted student visit', f'={K("contrib_visit")}-{K("net_visit")}*{R("student_disc")}', GBP2)
calc('stu_be_pct', 'Students: extra student visits needed to break even', f'={K("stu_cost")}/{K("stu_contrib")}/{K("stu_visits")}', PCT)
calc('early_visits', 'Early-bird visits per 1,000 members', f'={K("visits_1000")}*{R("early_share")}', NUM)
calc('early_pts', 'Extra points issued', f'={K("early_visits")}*{R("atv")}*{R("pts_per_gbp")}', NUM)
calc('early_cost', 'Early bird: cost per 1,000 members', f'={K("early_pts")}*(1-{R("brk_pts")})*{K("cost_point")}/100', GBP, bold=True)
calc('early_be_pct', 'Early bird: extra pre-9am visits needed to break even', f'={K("early_cost")}/{K("contrib_visit")}/{K("early_visits")}', PCT)

csec('6. Beans Club (per 1,000 members)')
calc('subs', 'Subscribers', f'={R("members")}*{R("club_share")}', NUM)
calc('club_bags', 'Club bags a year', f'={K("subs")}*{R("club_bags_pm")}*12', NUM)
calc('club_perk_unit', 'Perk cost per bag as proposed (discount + free posting)',
     f'={R("bag_price")}*{R("club_disc")}+{R("mailer")}+{R("post_ll")}', GBP2)
calc('club_cost', 'Beans Club as proposed: perk cost per 1,000 members', f'={K("club_bags")}*{K("club_perk_unit")}', GBP, bold=True)
calc('club_perk_adj', 'Perk cost per bag, recommended version',
     f'={R("bag_price")}*{R("club_disc")}+(1-{R("collect_share")})*({R("mailer")}+{R("post_ll")}-{R("single_post_charge")})', GBP2,
     'posted single bags pay £2.50; collected bags have no postage')
calc('club_cost_adj', 'Beans Club recommended: perk cost per 1,000 members', f'={K("club_bags")}*{K("club_perk_adj")}', GBP, bold=True)
calc('club_contrib_bag', 'Contribution per club bag, posted (from Unit economics)', "='Unit economics'!$I$8", GBP2)
calc('counter_contrib_bag', 'Contribution per bag at the counter', "='Unit economics'!$I$5", GBP2)
calc('club_be_bags', 'Bags a month a posted subscriber must take to match their counter buying',
     f'={R("counter_bags_pm")}*{K("counter_contrib_bag")}/{K("club_contrib_bag")}', NUM1)
calc('club_net', 'Club contribution less counter bags it replaces, per 1,000 members (proposed)',
     f'={K("club_bags")}*{K("club_contrib_bag")}-{K("subs")}*{R("counter_bags_pm")}*12*{K("counter_contrib_bag")}', GBP)
calc('club_contrib_adj', 'Contribution per club bag, recommended mix',
     f"={R('collect_share')}*'Unit economics'!$I$10+(1-{R('collect_share')})*'Unit economics'!$I$9", GBP2)
calc('club_net_adj', 'Club contribution less counter bags it replaces (recommended)',
     f'={K("club_bags")}*{K("club_contrib_adj")}-{K("subs")}*{R("counter_bags_pm")}*12*{K("counter_contrib_bag")}', GBP)

csec('7. Delivery (one-off online orders)')
calc('orders', 'One-off online orders per 1,000 members', f'={R("members")}*{R("online_orders")}', NUM)
calc('del_under', 'Orders under £30: delivery margin each (charge − mailer − Large Letter)', f'={R("delivery_charge")}-{R("mailer")}-{R("post_ll")}', GBP2)
calc('del_over', 'Orders £30+: delivery cost absorbed each (box + Small Parcel)', f'={R("box_sp")}+{R("post_sp")}', GBP2)
calc('del_cost', 'Delivery: net cost per 1,000 members',
     f'={K("orders")}*{R("share_over")}*{K("del_over")}-{K("orders")}*(1-{R("share_over")})*{K("del_under")}', GBP, bold=True)
calc('del_be', 'Extra bags a free-delivery order must add to pay for its postage', f'={K("del_over")}/{K("online_bag_contrib")}', NUM1)

csec('8. Gifting')
calc('gift_contrib', 'Gift subscription £36: contribution each', "='Unit economics'!$I$11", GBP2)
calc('gift_contrib_adj', 'Gift subscription at recommended price: contribution each', "='Unit economics'!$I$12", GBP2)
calc('gift_free_post', 'Gifting: delivery absorbed per 1,000 members (3 posts per gift)', f'={R("gifts")}*3*({R("mailer")}+{R("post_ll")})', GBP, bold=True)
calc('gift_total', 'Gift subscriptions: contribution per 1,000 members at £36', f'={R("gifts")}*{K("gift_contrib")}', GBP)
calc('gift_total_adj', 'Gift subscriptions: contribution at recommended price', f'={R("gifts")}*{K("gift_contrib_adj")}', GBP)
calc('gift_tail', 'Later Beans Club contribution from converted recipients (recommended mix)',
     f'={R("gifts")}*{R("gift_convert")}*{R("club_months")}*{R("club_bags_pm")}*{K("club_contrib_adj")}', GBP)
calc('disc_contrib', 'Discovery sets: contribution per 1,000 members',
     f"={R('discovery_sets')}*({R('disc_post_share')}*'Unit economics'!$I$13+(1-{R('disc_post_share')})*'Unit economics'!$I$14)", GBP)

C.column_dimensions['A'].width = 78
C.column_dimensions['B'].width = 14
C.column_dimensions['C'].width = 60
C.freeze_panes = 'A5'

# ---------------------------------------------------------------- Unit economics
U = wb.create_sheet('Unit economics')
U['A1'] = 'Bean, delivery and gift lines: contribution per order at cost'
U['A1'].font = TITLE
U['A2'] = ('Beans are treated as zero-rated food, so the price is also the net figure (confirm with the accountant). '
           'Points cost = 10 points per £1 of goods, after breakage, at the Calc cost per point. Staff packing time is left out (about 2 min a bag).')
U['A2'].font = Font(name=FONT, italic=True, color='595959')
U.merge_cells('A2:J2')
U['A2'].alignment = WRAP
U.row_dimensions[2].height = 30
heads = ['Line', 'Bags', 'Customer pays', 'Beans', 'Packaging', 'Postage', 'Payment fees', 'Points cost', 'Contribution', 'Contribution %']
for i, h in enumerate(heads):
    cell = U.cell(row=4, column=i + 1, value=h)
    cell.font = HEAD
    cell.fill = HEAD_FILL
    cell.alignment = WRAP


def ptsc(goods):
    return f'{goods}*{R("pts_per_gbp")}*(1-{R("brk_pts")})*{K("cost_point")}/100'


onl = lambda pay, bill=False: f'{pay}*({R("online_pct")}{"+" + R("billing_pct") if bill else ""})+{R("online_fixed")}'
lines = [
    # row 5..14: label, bags, pays, packaging, postage, fees, goods value for points
    ('Shop counter, 1 bag', 1, f'={R("bag_price")}', '=0', '=0', f'=C5*{R("card_fee")}', 'C5'),
    ('One-off online, 1 bag + £3.95 delivery', 1, f'={R("bag_price")}+{R("delivery_charge")}', f'={R("mailer")}', f'={R("post_ll")}', f'={onl("C6")}', R('bag_price')),
    ('One-off online, 3 bags, free delivery', 3, f'=3*{R("bag_price")}', f'={R("box_sp")}', f'={R("post_sp")}', f'={onl("C7")}', 'C7'),
    ('Beans Club as proposed: 1 bag posted free', 1, f'={R("bag_price")}*(1-{R("club_disc")})', f'={R("mailer")}', f'={R("post_ll")}', f'={onl("C8", True)}', 'C8'),
    ('Beans Club recommended: 1 bag posted, £2.50 delivery', 1, f'={R("bag_price")}*(1-{R("club_disc")})+{R("single_post_charge")}', f'={R("mailer")}', f'={R("post_ll")}', f'={onl("C9", True)}', f'{R("bag_price")}*(1-{R("club_disc")})'),
    ('Beans Club recommended: 1 bag collected in store', 1, f'={R("bag_price")}*(1-{R("club_disc")})', '=0', '=0', f'={onl("C10", True)}', 'C10'),
    ('Gift subscription as proposed: £36, 3 bags posted monthly', 3, f'={R("gift_price")}', f'=3*{R("mailer")}+{R("gift_card_cost")}', f'=3*{R("post_ll")}', f'={onl("C11")}', '0'),
    ('Gift subscription recommended price, 3 bags posted', 3, f'={R("gift_price_adj")}', f'=3*{R("mailer")}+{R("gift_card_cost")}', f'=3*{R("post_ll")}', f'={onl("C12")}', '0'),
    ('Discovery set £33, posted free (over £30)', 3, f'={R("disc_price")}', f'={R("box_sp")}', f'={R("post_sp")}', f'={onl("C13")}', 'C13'),
    ('Discovery set £33, collected', 3, f'={R("disc_price")}', '=0', '=0', f'=C14*{R("card_fee")}', 'C14'),
    ('Beans Club as proposed: 2 bags in one post (Small Parcel)', 2, f'=2*{R("bag_price")}*(1-{R("club_disc")})', f'={R("box_sp")}', f'={R("post_sp")}', f'={onl("C15", True)}', 'C15'),
]
for i, (label, bags, pays, pack, post, fee, goods) in enumerate(lines):
    r = 5 + i
    U[f'A{r}'] = label
    U[f'B{r}'] = bags
    U[f'C{r}'] = pays
    U[f'D{r}'] = f'=B{r}*{R("bag_cost")}'
    U[f'E{r}'] = pack
    U[f'F{r}'] = post
    U[f'G{r}'] = fee
    U[f'H{r}'] = f'={ptsc(goods)}' if goods != '0' else '=0'
    U[f'I{r}'] = f'=C{r}-D{r}-E{r}-F{r}-G{r}-H{r}'
    U[f'J{r}'] = f'=IF(C{r}=0,0,I{r}/C{r})'
    for c in 'ABCDEFGHIJ':
        U[f'{c}{r}'].font = BLACK
    for c in 'CDEFGHI':
        U[f'{c}{r}'].number_format = GBP2
    U[f'J{r}'].number_format = PCT
    U[f'I{r}'].font = BOLD
U['A17'] = 'Contribution per bag'
U['A17'].font = BOLD
for i in range(11):
    r = 5 + i
    U[f'A{18 + i}'] = f'=A{r}'
    U[f'B{18 + i}'] = f'=IF(B{r}=0,0,I{r}/B{r})'
    U[f'B{18 + i}'].number_format = GBP2
    U[f'A{18 + i}'].font = BLACK
    U[f'B{18 + i}'].font = BLACK
U['A30'] = 'Gift subscription: points not earned by the recipient, so points cost is zero. The gift buyer earns points under the normal rule if bought in the app (not modelled).'
U['A30'].font = Font(name=FONT, italic=True, color='595959')
U.column_dimensions['A'].width = 58
for c in 'BCDEFGHIJ':
    U.column_dimensions[c].width = 14
U.freeze_panes = 'B5'

# ---------------------------------------------------------------- Schemes summary
S = wb.create_sheet('Schemes', 0)
S['A1'] = 'Bija loyalty and offers: cost per 1,000 members a year, at cost price'
S['A1'].font = TITLE
S['A2'] = ('All figures are formulas from the Assumptions and Calc tabs. Break-even = extra visits (at the Calc contribution per visit) '
           'needed to pay for the scheme. Recommendation text is BizDev\'s call; the numbers behind it update when assumptions change.')
S['A2'].font = Font(name=FONT, italic=True, color='595959')
S.merge_cells('A2:I2')
S['A2'].alignment = WRAP
S.row_dimensions[2].height = 32
sh = ['Scheme', 'Proposed rule', 'Cost per 1,000 members a year (at cost)', 'Breakage assumed',
      'Margin impact (% of member net sales)', 'Break-even extra visits per 1,000 members', 'Break-even uplift (% of baseline visits)',
      'Recommendation', 'In one line']
for i, h in enumerate(sh):
    cell = S.cell(row=4, column=i + 1, value=h)
    cell.font = HEAD
    cell.fill = HEAD_FILL
    cell.alignment = WRAP
S.row_dimensions[4].height = 48

base_visits = K('visits_1000')
rows = [
    ('Points', '10 per £1 everywhere; cake 350, drink 400, bag 1,200; bonuses capped', K('pts_cost'), R('brk_pts'), base_visits,
     'KEEP', 'The core currency. About 4% of member net sales at cost; pays back with about 1.4 extra visits per member a year (6%).'),
    ('Stamps', '1 stamp per handcrafted drink, 10th free up to £5.50', K('stamp_cost'), R('brk_stamp'), base_visits,
     'DROP as a second currency', 'Duplicates the 400-point free drink and doubles the give-back. Keep the stamp grid only as a picture of progress to 400 points.'),
    ('Tiers', 'Seed, Sprout 1,500, Kopi Tree 5,000: perks, not multipliers', K('tier_cost'), None, K('tier_visits'),
     'KEEP', 'Cheap because perks are small and targeted at regulars; no multiplier cost.'),
    ('Referral', '+300 points each, staff-confirmed', K('ref_cost'), R('brk_pts'), base_visits,
     'KEEP, tighten', 'A referred friend pays it back in under one visit. Credit only after the friend\'s first paid order; cap 5 a month.'),
    ('Own cup', '25p off any hot drink in a reusable cup', K('cup_cost_total'), None, base_visits,
     'KEEP', 'Nearly free after the cup and lid saved; good for the brand.'),
    ('Students', '10% off with a student card', K('stu_cost'), None, K('stu_visits'),
     'DROP at launch', 'Needs about 18% more student visits to break even, in an area with few students. Revisit as an after-2pm offer.'),
    ('Early bird', 'Double points Mon–Fri before 9am', K('early_cost'), R('brk_pts'), K('early_visits'),
     'ADJUST: move to 2–4pm', 'Rewards commuters already in the peak queue. Same cost spent on the quiet afternoon can create visits.'),
    ('Beans Club (as proposed)', '£10.80 a bag, free delivery, every 2/3/4 weeks', K('club_cost'), None, base_visits,
     'ADJUST', 'A posted single bag makes about £1.20 against about £6.10 at the counter, so the club loses money against the bags it replaces. Free delivery from 2 bags, or collect in store.'),
    ('Beans Club (recommended)', '£10.80; collect free; posting free from 2 bags, £2.50 for 1', K('club_cost_adj'), None, base_visits,
     'Recommended version', 'Keeps the 10% headline; cuts the perk cost per bag from £4.70 to £1.70.'),
    ('Delivery', 'Royal Mail Tracked 48 £3.95, free over £30', K('del_cost'), None, base_visits,
     'KEEP', '£3.95 covers a 1-bag post; free over £30 costs about £4.55 and needs under 1 extra bag to pay back.'),
    ('Gifting: free postage inside £36 gift subscription', '£36 for 3 bags over 3 months, delivered', K('gift_free_post'), None, base_visits,
     'ADJUST: £42 posted', 'At £36 posted, each gift makes about £8 (23%). £36 is BizDev\'s collect price; posted should be about £42.'),
]
first = 5
for i, (name, rule, cost, brk, denom, rec, why) in enumerate(rows):
    r = first + i
    S[f'A{r}'] = name
    S[f'B{r}'] = rule
    S[f'C{r}'] = f'={cost}'
    S[f'D{r}'] = f'={brk}' if brk else 'n/a'
    S[f'E{r}'] = f'=C{r}/{K("net_1000")}'
    S[f'F{r}'] = f'=C{r}/{K("contrib_visit")}'
    S[f'G{r}'] = f'={K("stu_be_pct")}' if name == 'Students' else f'=IF({denom}=0,0,F{r}/{denom})'
    S[f'H{r}'] = rec
    S[f'I{r}'] = why
    for c in 'ABCDEFGHI':
        S[f'{c}{r}'].font = BLACK
        S[f'{c}{r}'].alignment = WRAP
    S[f'A{r}'].font = BOLD
    S[f'H{r}'].font = BOLD
    S[f'C{r}'].number_format = GBP
    S[f'D{r}'].number_format = PCT
    S[f'E{r}'].number_format = PCT
    S[f'F{r}'].number_format = NUM
    S[f'G{r}'].number_format = PCT
last = first + len(rows) - 1
tr = last + 2
S[f'A{tr}'] = 'All schemes as proposed'
S[f'C{tr}'] = f'=SUM(C{first}:C{first + 7})+C{first + 9}+C{first + 10}'
S[f'A{tr + 1}'] = 'As recommended (no stamps or students; club and gifting adjusted)'
# points, tiers, referral, own cup, early bird (moved, same cost), club recommended, delivery
S[f'C{tr + 1}'] = f'=C{first}+C{first + 2}+C{first + 3}+C{first + 4}+C{first + 6}+C{first + 8}+C{first + 9}'
for r in (tr, tr + 1):
    S[f'A{r}'].font = BOLD
    S[f'C{r}'].font = BOLD
    S[f'C{r}'].number_format = GBP
    S[f'E{r}'] = f'=C{r}/{K("net_1000")}'
    S[f'E{r}'].number_format = PCT
    S[f'F{r}'] = f'=C{r}/{K("contrib_visit")}'
    S[f'F{r}'].number_format = NUM
    S[f'G{r}'] = f'=F{r}/{base_visits}'
    S[f'G{r}'].number_format = PCT
    for c in 'ACEFG':
        S[f'{c}{r}'].border = TOP
S[f'A{tr + 2}'] = ('"As recommended" counts the gift subscription at £42, where postage is covered by the price, so its absorbed postage drops out. '
                   'Totals use the member base (24 visits each) for the uplift %.')
S[f'A{tr + 2}'].font = Font(name=FONT, italic=True, color='595959')
S.merge_cells(f'A{tr + 2}:I{tr + 2}')
S[f'A{tr + 2}'].alignment = WRAP
S.row_dimensions[tr + 2].height = 30

kr = tr + 4
S[f'A{kr}'] = 'Key figures'
S[f'A{kr}'].font = BOLD
keys = [
    ('Contribution per member visit', K('contrib_visit'), GBP2),
    ('Cost of one redeemed point', K('cost_point'), P4),
    ('Retail value of one redeemed point', K('retail_point'), P4),
    ('Points + stamps together: retail give-back per £ of member net sales', K('stamp_giveback'), PCT),
    ('Visits a referred friend must make to repay the referral', K('ref_be'), NUM1),
    ('Contribution per bag: counter', "'Unit economics'!$B$18", GBP2),
    ('Contribution per bag: Beans Club as proposed (posted)', "'Unit economics'!$B$21", GBP2),
    ('Contribution per bag: Beans Club recommended mix', K('club_contrib_adj'), GBP2),
    ('Bags a month a posted subscriber must take to match 0.5 counter bags', K('club_be_bags'), NUM1),
    ('Beans Club net of cannibalised counter bags, per 1,000 members (proposed)', K('club_net'), GBP),
    ('Beans Club net of cannibalised counter bags, per 1,000 members (recommended)', K('club_net_adj'), GBP),
    ('Extra bags a free-delivery order must add to pay its postage', K('del_be'), NUM1),
    ('Gift subscription contribution each: £36 as proposed', K('gift_contrib'), GBP2),
    ('Gift subscription contribution each: recommended price', K('gift_contrib_adj'), GBP2),
    ('Later club contribution from converted gift recipients, per 1,000 members', K('gift_tail'), GBP),
    ('Discovery set contribution, per 1,000 members', K('disc_contrib'), GBP),
]
for i, (label, ref, fmt) in enumerate(keys):
    r = kr + 1 + i
    S[f'A{r}'] = label
    S[f'C{r}'] = f'={ref}'
    S[f'C{r}'].number_format = fmt
    S[f'C{r}'].font = GREEN
    S[f'A{r}'].font = BLACK
    S.merge_cells(f'A{r}:B{r}')

widths = {'A': 30, 'B': 34, 'C': 16, 'D': 11, 'E': 13, 'F': 14, 'G': 13, 'H': 22, 'I': 62}
for c, w in widths.items():
    S.column_dimensions[c].width = w
S.freeze_panes = 'B5'

# ---------------------------------------------------------------- Sensitivity
T = wb.create_sheet('Sensitivity')
T['A1'] = 'Sensitivity'
T['A1'].font = TITLE
T['A3'] = 'Points cost per 1,000 members a year at different breakage rates'
T['A3'].font = BOLD
for i, h in enumerate(['Breakage', 'Cost at cost price', '% of member net sales', 'Break-even uplift']):
    cell = T.cell(row=4, column=i + 1, value=h)
    cell.font = HEAD
    cell.fill = HEAD_FILL
for i, b in enumerate([0, 0.10, 0.20, 0.25, 0.30, 0.40]):
    r = 5 + i
    T[f'A{r}'] = b
    T[f'A{r}'].font = BLUE
    T[f'A{r}'].number_format = PCT
    T[f'B{r}'] = f'={K("pts_total")}*(1-A{r})*{K("cost_point")}/100*{R("members")}'
    T[f'B{r}'].number_format = GBP
    T[f'C{r}'] = f'=B{r}/{K("net_1000")}'
    T[f'C{r}'].number_format = PCT
    T[f'D{r}'] = f'=B{r}/{K("contrib_visit")}/{K("visits_1000")}'
    T[f'D{r}'].number_format = PCT
T['A13'] = 'Contribution per bag at different bean costs (200 g, incl. bag)'
T['A13'].font = BOLD
for i, h in enumerate(['Bean cost', 'Counter', 'Club as proposed (posted)', 'Club posted, £2.50 delivery', 'Club collected']):
    cell = T.cell(row=14, column=i + 1, value=h)
    cell.font = HEAD
    cell.fill = HEAD_FILL
    cell.alignment = WRAP
for i, bc in enumerate([3.00, 4.00, 4.80, 5.40, 6.00]):
    r = 15 + i
    T[f'A{r}'] = bc
    T[f'A{r}'].font = BLUE
    T[f'A{r}'].number_format = GBP2
    for col, ur in zip('BCDE', (5, 8, 9, 10)):
        T[f'{col}{r}'] = f"='Unit economics'!$I${ur}+{R('bag_cost')}-A{r}"
        T[f'{col}{r}'].number_format = GBP2
T['A21'] = 'Each line swaps the Assumptions bean cost for the one in column A, holding everything else.'
T['A21'].font = Font(name=FONT, italic=True, color='595959')
T['A23'] = 'Beans Club perk cost per 1,000 members by subscriber share'
T['A23'].font = BOLD
for i, h in enumerate(['Members subscribing', 'As proposed', 'Recommended']):
    cell = T.cell(row=24, column=i + 1, value=h)
    cell.font = HEAD
    cell.fill = HEAD_FILL
for i, s in enumerate([0.04, 0.08, 0.12, 0.16]):
    r = 25 + i
    T[f'A{r}'] = s
    T[f'A{r}'].font = BLUE
    T[f'A{r}'].number_format = PCT
    T[f'B{r}'] = f'={R("members")}*A{r}*{R("club_bags_pm")}*12*{K("club_perk_unit")}'
    T[f'C{r}'] = f'={R("members")}*A{r}*{R("club_bags_pm")}*12*{K("club_perk_adj")}'
    T[f'B{r}'].number_format = GBP
    T[f'C{r}'].number_format = GBP
for c, w in {'A': 22, 'B': 18, 'C': 22, 'D': 22, 'E': 16}.items():
    T.column_dimensions[c].width = w

for ws in wb.worksheets:
    for r in ws.iter_rows():
        for cell in r:
            if cell.font is None or cell.font.name != FONT:
                f = cell.font
                cell.font = Font(name=FONT, bold=f.bold, italic=f.italic, color=f.color, size=f.size)

wb.save(OUT)
print('saved', OUT)
