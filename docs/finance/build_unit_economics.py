"""Build docs/finance/bija-unit-economics.xlsx: inputs, monthly P&L x3 scenarios, break-even, 13-week cash flow.

Usage: python3 docs/finance/build_unit_economics.py docs/finance/bija-unit-economics.xlsx
Then open it in Excel or recalculate (LibreOffice) so the formulas show values. Editing the inputs in the xlsx is the normal way to use it;
rerun this only to change the structure (it overwrites the file and any figures typed into it)."""
import datetime as dt
import sys
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.comments import Comment
from openpyxl.formatting.rule import FormulaRule
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.utils import get_column_letter as L

OUT = sys.argv[1]
F = 'Arial'
BLUE, GREEN, BLACK = '0000FF', '008000', '000000'
YELLOW = PatternFill('solid', fgColor='FFF2CC')
HEAD = PatternFill('solid', fgColor='0B0B0B')
SUB = PatternFill('solid', fgColor='EDEDED')
thin = Side(style='thin', color='BFBFBF')
TOP = Border(top=Side(style='thin', color='000000'))

GBP = '£#,##0;(£#,##0);-'
GBP2 = '£#,##0.00;(£#,##0.00);-'
PCT = '0.0%;(0.0%);-'
PCT2 = '0.00%;(0.00%);-'
NUM = '#,##0;(#,##0);-'
NUM1 = '#,##0.0;(#,##0.0);-'

wb = Workbook()


def font(color=BLACK, bold=False, size=10, italic=False):
    return Font(name=F, color=color, bold=bold, size=size, italic=italic)


def put(ws, ref, v, fmt=None, color=BLACK, bold=False, fill=None, italic=False, wrap=False, size=10):
    c = ws[ref]
    c.value = v
    c.font = font(color, bold, size, italic)
    if fmt:
        c.number_format = fmt
    if fill:
        c.fill = fill
    if wrap:
        c.alignment = Alignment(wrap_text=True, vertical='top')
    return c


def header_row(ws, row, labels, start=1):
    for i, t in enumerate(labels):
        c = ws.cell(row=row, column=start + i, value=t)
        c.font = Font(name=F, color='FFFFFF', bold=True, size=10)
        c.fill = HEAD
        c.alignment = Alignment(horizontal='center' if i else 'left', vertical='center', wrap_text=True)


def title(ws, text, sub):
    put(ws, 'A1', text, bold=True, size=14)
    put(ws, 'A2', sub, italic=True, color='595959')


# ---------------------------------------------------------------- Inputs
inp = wb.active
inp.title = 'Inputs'
title(inp, 'Bija unit economics: inputs',
      'Every blue number is an ASSUMPTION. Replace it with Bija\'s real figures (till reports, lease, payroll, bills). VAT: confirm with your accountant.')
put(inp, 'A4', 'Scenario used by the 13-week cash flow', bold=True)
put(inp, 'C4', 'Base', color=BLUE, bold=True, fill=YELLOW)
put(inp, 'D4', '← choose Low, Base or High', italic=True, color='595959')
dv = DataValidation(type='list', formula1='"Low,Base,High"', allow_blank=False)
inp.add_data_validation(dv)
dv.add('C4')

header_row(inp, 6, ['Assumption', 'Unit', 'Low', 'Base', 'High', 'Used in cash flow', 'Where the number comes from / what to replace it with'])
R = {}  # key -> row on Inputs
row = 7


def section(name):
    global row
    put(inp, f'A{row}', name, bold=True, fill=SUB)
    for col in 'BCDEFG':
        inp[f'{col}{row}'].fill = SUB
    row += 1


def item(key, label, unit, low, base, high, fmt, note, key_input=False):
    global row
    R[key] = row
    put(inp, f'A{row}', label)
    put(inp, f'B{row}', unit, color='595959')
    for col, v in zip('CDE', (low, base, high)):
        put(inp, f'{col}{row}', v, fmt, color=BLUE, fill=YELLOW if key_input else None)
    put(inp, f'F{row}', f'=INDEX(C{row}:E{row},MATCH($C$4,$C$6:$E$6,0))', fmt)
    put(inp, f'G{row}', note, wrap=True, color='404040')
    row += 1


section('Sales')
item('days_week', 'Trading days per week', 'days', 7, 7, 7, NUM,
     'Opening hours in app.html are 7 days a week. Reduce if Bija closes on any day.')
item('tx_day', 'Transactions per day (average)', 'sales', 140, 200, 260, NUM,
     'ASSUMPTION. From the till: total transactions in a month ÷ trading days.', True)
item('atv', 'Average transaction value, incl. VAT', '£', 5.90, 6.23, 6.60, GBP2,
     'Base £6.23 = UK café benchmark given in the Sprint 2 brief. Replace with Bija\'s till: takings ÷ transactions.', True)
item('std_share', 'Share of takings that is standard-rated for VAT', '%', 0.85, 0.85, 0.85, PCT,
     'Hot drinks and anything eaten in are 20%. Cold takeaway food and bags of coffee beans are usually zero-rated. Confirm the split with your accountant.')
item('vat_rate', 'VAT standard rate', '%', 0.20, 0.20, 0.20, PCT,
     'UK standard rate 20% (HMRC).')
item('vat_reg', 'VAT registered? (1 = yes, 0 = no)', 'flag', 1, 1, 1, '0',
     'Registration is compulsory once taxable turnover passes £90,000 in a rolling 12 months (threshold since 1 April 2024). At these volumes Bija will be above it. Confirm with your accountant.')
item('gm', 'Gross margin on net sales (after coffee, milk, food, cups)', '%', 0.65, 0.68, 0.71, PCT,
     'ASSUMPTION. 68% matches the app\'s Finance default. Work it out from supplier invoices: 1 − (cost of stock used ÷ net sales).', True)
item('card_share', 'Share of takings paid by card', '%', 0.92, 0.95, 0.97, PCT,
     'ASSUMPTION. From the till\'s end-of-day report: card ÷ (card + cash).')
item('card_fee', 'Card processing fee', '% of card takings', 0.0175, 0.0175, 0.0175, PCT2,
     'Square 1.75% in person; SumUp 1.69% (0.99% on UK consumer cards with Payments Plus at £19/month). See docs/fullstack/pos-integration.md. Use your provider\'s statement.')

section('Monthly overheads (enter ex VAT)')
item('rent', 'Rent and service charge', '£/month', 6000, 6000, 6000, GBP,
     'ASSUMPTION. Take from the lease and service charge budget (St James\'s Market).', True)
item('rates', 'Business rates (after any relief)', '£/month', 1200, 1200, 1200, GBP,
     'ASSUMPTION. Annual bill from Westminster City Council ÷ 12. No VAT.')
item('staff_hours', 'Paid staff hours per trading day (not the owner)', 'hours', 18, 22, 28, NUM,
     'ASSUMPTION. Busier days need more barista hours, so this rises with the scenario. Use the rota.', True)
item('staff_rate', 'Loaded staff cost per hour', '£/hour', 17.50, 17.50, 17.50, GBP2,
     'ASSUMPTION. Hourly pay (at least the National Living Wage; London Living Wage if you are an accredited employer) plus employer NI, pension and holiday pay, typically +15–25%. Use payroll.', True)
item('owner_pay', 'Owner\'s pay or drawings', '£/month', 0, 0, 0, GBP,
     'Set to what the owner needs to live on to see the true break-even. 0 = profit before paying the owner.')
item('utilities', 'Utilities (energy, water, waste)', '£/month', 650, 650, 650, GBP, 'ASSUMPTION. From bills.')
item('insurance', 'Insurance', '£/month', 150, 150, 150, GBP, 'ASSUMPTION. Annual premium ÷ 12. No VAT (insurance premium tax instead).')
item('software', 'Software and subscriptions (till, accounts, app)', '£/month', 120, 120, 120, GBP, 'ASSUMPTION. Till plan, Xero/QuickBooks, music licence, app hosting.')
item('accountant', 'Accountant and bookkeeping', '£/month', 250, 250, 250, GBP, 'ASSUMPTION. Annual fee ÷ 12.')
item('marketing', 'Marketing', '£/month', 200, 200, 200, GBP, 'ASSUMPTION.')
item('repairs', 'Repairs, maintenance, equipment servicing', '£/month', 150, 150, 150, GBP, 'ASSUMPTION. Grinder burrs, espresso machine service, water filters.')
item('other', 'Other (cleaning, laundry, bank charges, sundries)', '£/month', 300, 300, 300, GBP, 'ASSUMPTION.')

section('VAT on costs (for the cash flow)')
item('rent_vat', 'Landlord charges VAT on rent? (1 = yes, 0 = no)', 'flag', 1, 1, 1, '0',
     'ASSUMPTION. Many commercial landlords "opt to tax". Check your rent invoices.')
item('cogs_vat', 'Share of cost of sales that carries VAT', '%', 0.30, 0.30, 0.30, PCT,
     'ASSUMPTION. Milk, coffee and most food are zero-rated; cups, lids, cleaning products and soft drinks carry 20%.')
item('oh_vat', 'Share of utilities, software, accountant, marketing, repairs and other that carries VAT', '%', 1, 1, 1, PCT,
     'ASSUMPTION. Most of these suppliers charge 20% (business energy too). Rates, insurance and wages have no VAT.')

row += 1
put(inp, f'A{row}', 'Cash-flow inputs (one value, not per scenario)', bold=True, fill=SUB)
for col in 'BCDEFG':
    inp[f'{col}{row}'].fill = SUB
row += 1
header_row(inp, row, ['Assumption', 'Unit', 'Value', '', '', '', 'Where the number comes from'])
row += 1
C = {}


def cfi(key, label, unit, v, fmt, note, key_input=False):
    global row
    C[key] = row
    put(inp, f'A{row}', label)
    put(inp, f'B{row}', unit, color='595959')
    put(inp, f'C{row}', v, fmt, color=BLUE, fill=YELLOW if key_input else None)
    put(inp, f'G{row}', note, wrap=True, color='404040')
    row += 1


cfi('start', 'Forecast start (a Monday)', 'date', dt.date(2026, 11, 2), 'ddd d mmm yyyy', 'First week of the forecast.')
cfi('open_bal', 'Opening bank balance', '£', 15000, GBP, 'ASSUMPTION. Business bank balance on the start date.', True)
cfi('buffer', 'Minimum cash buffer', '£', 5000, GBP, 'Weeks whose closing balance falls below this turn red on the Cash flow sheet.')
cfi('rent_week', 'Week number of the next rent quarter payment', 'week', 8, '0',
    'Rent is usually paid quarterly in advance on the quarter days (25 Dec falls in week 8 here). Repeats every 13 weeks. Check the lease.')
cfi('vat_week', 'Week number of the next VAT payment to HMRC', 'week', 1, '0',
    'A VAT return is due 1 month and 7 days after the quarter ends (quarter to 30 Sep → 7 Nov). Use 0 if none in the next 13 weeks.')
cfi('vat_amt', 'Amount of that VAT payment', '£', 9000, GBP, 'ASSUMPTION. From the VAT return already prepared for that quarter.', True)

inp.column_dimensions['A'].width = 52
inp.column_dimensions['B'].width = 16
for col in 'CDEF':
    inp.column_dimensions[col].width = 13
inp.column_dimensions['G'].width = 80
inp.freeze_panes = 'B7'


def I(key, col):  # reference to an input for a scenario column (C/D/E) or selected (F)
    return f'Inputs!${col}${R[key]}'


def CF(key):
    return f'Inputs!$C${C[key]}'


# ---------------------------------------------------------------- Monthly P&L
pl = wb.create_sheet('Monthly P&L')
title(pl, 'Monthly profit and loss: three scenarios',
      'A typical trading month. All numbers are formulas from the Inputs sheet (green = taken from another sheet). Before tax, depreciation and loan repayments.')
header_row(pl, 4, ['Line', 'Low', 'Base', 'High', 'How it is worked out'])
P = {}
prow = 5
SC = {'B': 'C', 'C': 'D', 'D': 'E'}  # P&L column -> Inputs scenario column


def pline(key, label, formula, fmt=GBP, bold=False, note='', link=False, top=False):
    """formula: callable(inputs_col, pl_col) -> str"""
    global prow
    P[key] = prow
    put(pl, f'A{prow}', label, bold=bold)
    for pc, ic in SC.items():
        c = put(pl, f'{pc}{prow}', formula(ic, pc), fmt, color=GREEN if link else BLACK, bold=bold)
        if top:
            c.border = TOP
    put(pl, f'E{prow}', note, color='595959', italic=True)
    prow += 1


def blank():
    global prow
    prow += 1


pline('days', 'Trading days per month', lambda i, p: f'={I("days_week", i)}*52/12', NUM1, note='days per week × 52 ÷ 12', link=True)
pline('tx', 'Transactions per month', lambda i, p: f'={I("tx_day", i)}*{p}{P["days"]}', NUM, link=True)
pline('atv', 'Average transaction value (incl. VAT)', lambda i, p: f'={I("atv", i)}', GBP2, link=True)
blank()
pline('takings', 'Takings incl. VAT', lambda i, p: f'={p}{P["tx"]}*{p}{P["atv"]}', bold=True)
pline('vat', 'less VAT on sales', lambda i, p: f'=-{p}{P["takings"]}*{I("std_share", i)}*{I("vat_rate", i)}/(1+{I("vat_rate", i)})*{I("vat_reg", i)}',
      note='standard-rated share × 20/120')
pline('net', 'Net sales', lambda i, p: f'={p}{P["takings"]}+{p}{P["vat"]}', bold=True, top=True)
pline('cogs', 'Cost of sales', lambda i, p: f'=-{p}{P["net"]}*(1-{I("gm", i)})', note='net sales × (1 − gross margin)')
pline('gp', 'Gross profit', lambda i, p: f'={p}{P["net"]}+{p}{P["cogs"]}', bold=True, top=True)
pline('fees', 'Card fees', lambda i, p: f'=-{p}{P["takings"]}*{I("card_share", i)}*{I("card_fee", i)}', note='card takings × fee %')
pline('contrib', 'Contribution after card fees', lambda i, p: f'={p}{P["gp"]}+{p}{P["fees"]}', bold=True, top=True)
blank()
put(pl, f'A{prow}', 'Overheads', bold=True)
prow += 1
first_oh = prow
pline('rent', 'Rent and service charge', lambda i, p: f'=-{I("rent", i)}', link=True)
pline('rates', 'Business rates', lambda i, p: f'=-{I("rates", i)}', link=True)
pline('staff', 'Staff', lambda i, p: f'=-{I("staff_hours", i)}*{I("staff_rate", i)}*{p}{P["days"]}', note='hours per day × loaded rate × trading days')
pline('owner', 'Owner\'s pay or drawings', lambda i, p: f'=-{I("owner_pay", i)}', link=True)
for k, lab in [('utilities', 'Utilities'), ('insurance', 'Insurance'), ('software', 'Software and subscriptions'),
               ('accountant', 'Accountant and bookkeeping'), ('marketing', 'Marketing'), ('repairs', 'Repairs and maintenance'), ('other', 'Other')]:
    pline(k, lab, lambda i, p, k=k: f'=-{I(k, i)}', link=True)
last_oh = prow - 1
pline('oh', 'Total overheads', lambda i, p: f'=SUM({p}{first_oh}:{p}{last_oh})', bold=True, top=True)
blank()
pline('op', 'Operating profit per month', lambda i, p: f'={p}{P["contrib"]}+{p}{P["oh"]}', bold=True)
pline('margin', 'Operating margin (% of net sales)', lambda i, p: f'=IF({p}{P["net"]}=0,0,{p}{P["op"]}/{p}{P["net"]})', PCT)
pline('year', 'Operating profit per year', lambda i, p: f'={p}{P["op"]}*12', bold=True)
blank()
put(pl, f'A{prow}', 'Key ratios', bold=True)
prow += 1
pline('staff_pct', 'Staff cost as % of net sales', lambda i, p: f'=IF({p}{P["net"]}=0,0,-{p}{P["staff"]}/{p}{P["net"]})', PCT, note='cafés often aim for 25–35%')
pline('rent_pct', 'Rent and rates as % of net sales', lambda i, p: f'=IF({p}{P["net"]}=0,0,-({p}{P["rent"]}+{p}{P["rates"]})/{p}{P["net"]})', PCT, note='cafés often aim for under 10–15%')
pline('fee_pct', 'Card fees as % of takings', lambda i, p: f'=IF({p}{P["takings"]}=0,0,-{p}{P["fees"]}/{p}{P["takings"]})', PCT2)
blank()
put(pl, f'A{prow}', 'Costs are entered ex VAT, which is right for a VAT-registered business (it reclaims VAT on costs). Corporation tax, depreciation and loan repayments are not included.',
    italic=True, color='595959')
pl.column_dimensions['A'].width = 44
for col in 'BCD':
    pl.column_dimensions[col].width = 14
pl.column_dimensions['E'].width = 44
pl.freeze_panes = 'B5'

# ---------------------------------------------------------------- Break-even
be = wb.create_sheet('Break-even')
title(be, 'Break-even transactions per day',
      'How many sales a day cover all overheads, per scenario. Formulas only; change the Inputs sheet.')
header_row(be, 4, ['Line', 'Low', 'Base', 'High', 'How it is worked out'])
B = {}
brow = 5


def bline(key, label, formula, fmt, bold=False, note='', link=False, top=False):
    global brow
    B[key] = brow
    put(be, f'A{brow}', label, bold=bold)
    for pc, ic in SC.items():
        c = put(be, f'{pc}{brow}', formula(ic, pc), fmt, color=GREEN if link else BLACK, bold=bold)
        if top:
            c.border = TOP
    put(be, f'E{brow}', note, color='595959', italic=True)
    brow += 1


bline('atv', 'Average transaction value (incl. VAT)', lambda i, p: f'={I("atv", i)}', GBP2, link=True)
bline('net', 'Net sales per transaction (ex VAT)', lambda i, p: f'={p}{B["atv"]}*(1-{I("std_share", i)}*{I("vat_rate", i)}/(1+{I("vat_rate", i)})*{I("vat_reg", i)})', GBP2)
bline('gp', 'Gross profit per transaction', lambda i, p: f'={p}{B["net"]}*{I("gm", i)}', GBP2)
bline('fee', 'Card fee per transaction', lambda i, p: f'={p}{B["atv"]}*{I("card_share", i)}*{I("card_fee", i)}', GBP2)
bline('cpt', 'Contribution per transaction', lambda i, p: f'={p}{B["gp"]}-{p}{B["fee"]}', GBP2, bold=True, top=True)
brow += 1
bline('oh', 'Overheads per month', lambda i, p: f"=-'Monthly P&L'!{p}{P['oh']}", GBP, link=True)
bline('days', 'Trading days per month', lambda i, p: f"='Monthly P&L'!{p}{P['days']}", NUM1, link=True)
bline('be_m', 'Break-even transactions per month', lambda i, p: f'=IF({p}{B["cpt"]}<=0,0,{p}{B["oh"]}/{p}{B["cpt"]})', NUM)
bline('be_d', 'Break-even transactions per day', lambda i, p: f'=IF({p}{B["days"]}=0,0,{p}{B["be_m"]}/{p}{B["days"]})', NUM, bold=True)
bline('be_take', 'Break-even takings per day (incl. VAT)', lambda i, p: f'={p}{B["be_d"]}*{p}{B["atv"]}', GBP, bold=True)
brow += 1
bline('plan', 'Planned transactions per day', lambda i, p: f'={I("tx_day", i)}', NUM, link=True)
bline('head', 'Headroom (transactions per day above break-even)', lambda i, p: f'={p}{B["plan"]}-{p}{B["be_d"]}', NUM)
bline('mos', 'Margin of safety', lambda i, p: f'=IF({p}{B["plan"]}=0,0,{p}{B["head"]}/{p}{B["plan"]})', PCT, bold=True,
      note='how far sales can fall before a loss')
brow += 1
put(be, f'A{brow}', 'Staff hours are treated as a fixed cost for the month (they are set by the rota, not by each sale).', italic=True, color='595959')
brow += 2

put(be, f'A{brow}', 'Sensitivity: operating profit per month at different transactions per day', bold=True)
brow += 1
header_row(be, brow, ['Transactions per day', 'Low', 'Base', 'High', ''])
brow += 1
sens_first = brow
for n in range(100, 376, 25):
    put(be, f'A{brow}', n, NUM, color=BLUE)
    for pc in 'BCD':
        put(be, f'{pc}{brow}', f'=$A{brow}*{pc}${B["days"]}*{pc}${B["cpt"]}-{pc}${B["oh"]}', GBP)
    brow += 1
sens_last = brow - 1
put(be, f'A{brow}', 'Each scenario keeps its own prices, margin and overheads; only transactions per day change. Red = a loss.', italic=True, color='595959')
be.conditional_formatting.add(f'B{sens_first}:D{sens_last}', FormulaRule(formula=[f'B{sens_first}<0'], font=Font(name=F, color='C00000', bold=True)))
be.column_dimensions['A'].width = 46
for col in 'BCD':
    be.column_dimensions[col].width = 14
be.column_dimensions['E'].width = 40

# ---------------------------------------------------------------- 13-week cash flow
cf = wb.create_sheet('Cash flow 13w')
title(cf, '13-week cash-flow forecast',
      'Uses the scenario chosen on Inputs (cell C4). Blue rows on this sheet (seasonality, one-offs) are assumptions you can change week by week.')
put(cf, 'A3', 'Scenario:', bold=True)
put(cf, 'B3', '=Inputs!$C$4', color=GREEN, bold=True)
W = 13
cols = [L(2 + k) for k in range(W)]  # B..N
tot = L(2 + W)  # O
header_row(cf, 5, ['Week'] + [f'{k + 1}' for k in range(W)] + ['13 weeks'])
Q = {}
crow = 6


def S(key):
    return I(key, 'F')


def cline(key, label, f, fmt=GBP, bold=False, color=BLACK, total=True, top=False, fill=None):
    global crow
    Q[key] = crow
    put(cf, f'A{crow}', label, bold=bold)
    for k, c in enumerate(cols):
        v = f(k, c)
        cell = put(cf, f'{c}{crow}', v, fmt, color=color if not (isinstance(v, str) and v.startswith('=')) or color != BLUE else BLACK, bold=bold, fill=fill)
        if color == BLUE:
            cell.font = font(BLUE, bold)
        if top:
            cell.border = TOP
    if total:
        c = put(cf, f'{tot}{crow}', f'=SUM(B{crow}:{L(1 + W)}{crow})', fmt, bold=True)
        if top:
            c.border = TOP
    crow += 1


cline('wk', 'Week number', lambda k, c: k + 1, '0', total=False)
cline('start', 'Week starting', lambda k, c: f'={CF("start")}+7*({c}{Q["wk"]}-1)', 'd mmm', total=False)
cline('season', 'Seasonality (1.00 = normal week)', lambda k, c: {6: 1.10, 7: 0.85, 8: 0.60, 9: 0.85}.get(k, 1.0), '0.00', color=BLUE, total=False, fill=YELLOW)
cline('tx', 'Transactions', lambda k, c: f'={S("tx_day")}*{S("days_week")}*{c}{Q["season"]}', NUM)
crow += 1
put(cf, f'A{crow}', 'Cash in', bold=True)
crow += 1
cline('takings', 'Takings incl. VAT', lambda k, c: f'={c}{Q["tx"]}*{S("atv")}')
cline('card', '  of which card', lambda k, c: f'={c}{Q["takings"]}*{S("card_share")}')
cline('cash', '  of which cash', lambda k, c: f'={c}{Q["takings"]}-{c}{Q["card"]}')
cline('other_in', 'Other receipts (grants, loans, events)', lambda k, c: 0, color=BLUE)
cline('in', 'Total cash in', lambda k, c: f'={c}{Q["takings"]}+{c}{Q["other_in"]}', bold=True, top=True)
crow += 1
put(cf, f'A{crow}', 'Cash out', bold=True)
crow += 1
cline('netsales', 'memo: net sales (ex VAT)', lambda k, c: f'={c}{Q["takings"]}*(1-{S("std_share")}*{S("vat_rate")}/(1+{S("vat_rate")})*{S("vat_reg")})', total=True)
cf[f'A{Q["netsales"]}'].font = font('595959', italic=True)
cline('supplies', 'Stock and supplies (incl. VAT)', lambda k, c: f'={c}{Q["netsales"]}*(1-{S("gm")})*(1+{S("vat_rate")}*{S("cogs_vat")})')
cline('fees', 'Card fees', lambda k, c: f'={c}{Q["card"]}*{S("card_fee")}')
cline('staff', 'Staff', lambda k, c: f'={S("staff_hours")}*{S("staff_rate")}*{S("days_week")}')
oh_vatable = '+'.join(S(k) for k in ['utilities', 'software', 'accountant', 'marketing', 'repairs', 'other'])
oh_all = '+'.join(S(k) for k in ['rates', 'insurance', 'utilities', 'software', 'accountant', 'marketing', 'repairs', 'other'])
cline('oh', 'Overheads (weekly share, incl. VAT)', lambda k, c: f'=(({oh_all})+({oh_vatable})*{S("oh_vat")}*{S("vat_rate")})*12/52')
cline('owner', 'Owner\'s pay or drawings', lambda k, c: f'={S("owner_pay")}*12/52')
cline('rent', 'Rent (quarterly, incl. VAT)', lambda k, c: f'=IF(AND({CF("rent_week")}>0,{c}{Q["wk"]}>={CF("rent_week")},MOD({c}{Q["wk"]}-{CF("rent_week")},13)=0),{S("rent")}*3*(1+{S("vat_rate")}*{S("rent_vat")}),0)')
cline('vatpay', 'VAT paid to HMRC', lambda k, c: f'=IF({c}{Q["wk"]}={CF("vat_week")},{CF("vat_amt")},0)')
cline('oneoff', 'One-off payments (equipment, tax, loan)', lambda k, c: 0, color=BLUE)
cline('out', 'Total cash out', lambda k, c: f'=SUM({c}{Q["supplies"]}:{c}{Q["oneoff"]})', bold=True, top=True)
crow += 1
cline('net', 'Net cash flow', lambda k, c: f'={c}{Q["in"]}-{c}{Q["out"]}', bold=True)
cline('open', 'Opening balance', lambda k, c: f'={CF("open_bal")}' if k == 0 else f'={cols[k - 1]}{crow + 1}', total=False)
cline('close', 'Closing balance', lambda k, c: f'={c}{Q["open"]}+{c}{Q["net"]}', bold=True, total=False, top=True)
put(cf, f'{tot}{Q["open"]}', f'=B{Q["open"]}', GBP, bold=True)
put(cf, f'{tot}{Q["close"]}', f'={L(1 + W)}{Q["close"]}', GBP, bold=True)
cline('low', 'Below minimum buffer?', lambda k, c: f'=IF({c}{Q["close"]}<{CF("buffer")},"LOW","")', '@', total=False)
cf.conditional_formatting.add(f'B{Q["close"]}:{L(1 + W)}{Q["close"]}',
                              FormulaRule(formula=[f'B{Q["close"]}<{CF("buffer")}'], fill=PatternFill('solid', fgColor='F4CCCC'), font=Font(name=F, color='C00000', bold=True)))
crow += 1
put(cf, f'A{crow}', 'Lowest closing balance in 13 weeks', bold=True)
put(cf, f'B{crow}', f'=MIN(B{Q["close"]}:{L(1 + W)}{Q["close"]})', GBP, bold=True)
Q['lowest'] = crow
crow += 2
put(cf, f'A{crow}', 'VAT building up for the next return (memo, not yet paid)', bold=True)
crow += 1
cline('out_vat', 'VAT on sales', lambda k, c: f'=({c}{Q["takings"]}-{c}{Q["netsales"]})')
cline('in_vat', 'VAT reclaimable on costs', lambda k, c: f'=({c}{Q["netsales"]}*(1-{S("gm")})*{S("cogs_vat")}+({oh_vatable})*{S("oh_vat")}*12/52)*{S("vat_rate")}*{S("vat_reg")}+IF({c}{Q["rent"]}>0,{S("rent")}*3*{S("vat_rate")}*{S("rent_vat")}*{S("vat_reg")},0)')
cline('vat_net', 'Net VAT owed for these weeks', lambda k, c: f'={c}{Q["out_vat"]}-{c}{Q["in_vat"]}', bold=True, top=True)
cline('vat_cum', 'Running total to set aside', lambda k, c: f'={c}{Q["vat_net"]}' if k == 0 else f'={cols[k - 1]}{crow}+{c}{Q["vat_net"]}', total=False)
for r in (Q['out_vat'], Q['in_vat'], Q['vat_net'], Q['vat_cum']):
    cf[f'A{r}'].font = font('595959', bold=r == Q['vat_net'], italic=True)
crow += 1
notes = [
    'Simplifications: card takings are counted in the week taken (providers usually settle next working day); wages are spread weekly (if you pay monthly, move them with the One-off row);',
    'monthly bills are spread evenly at 12/52 per week; rent is paid quarterly in advance from the week set on Inputs. Corporation tax, PAYE timing and loan repayments: add in the One-off row.',
    'Gift cards: money from gift cards sold is cash in now but a liability until redeemed. Add large gift card sales (e.g. corporate Christmas orders) in Other receipts.',
]
for t in notes:
    put(cf, f'A{crow}', t, italic=True, color='595959')
    crow += 1
cf.column_dimensions['A'].width = 46
for c in cols + [tot]:
    cf.column_dimensions[c].width = 11
cf.freeze_panes = 'B6'

# ---------------------------------------------------------------- Read me (first sheet)
rd = wb.create_sheet('Read me', 0)
title(rd, 'Bija unit economics model',
      'Bija, 2a St James\'s Market, London. Built 29 Oct 2026 by the Full stack & Finance team. Draft for the owner; not financial or tax advice.')
lines = [
    ('How to use', True),
    ('1. Go to Inputs and replace every blue number with Bija\'s real figures. Yellow cells matter most.', False),
    ('2. Monthly P&L and Break-even show Low, Base and High side by side. They are all formulas: do not type over them.', False),
    ('3. Choose the scenario for the 13-week cash flow in Inputs!C4. Adjust the blue seasonality and one-off rows on the Cash flow sheet.', False),
    ('', False),
    ('Colour key', True),
    ('Blue text = an input (assumption). Replace with real figures.', False),
    ('Yellow fill = a key assumption: change these first.', False),
    ('Black text = a formula.  Green text = a formula taken from another sheet.', False),
    ('Red on Cash flow = closing balance below your minimum cash buffer.', False),
    ('', False),
    ('Headline (Base scenario unless stated)', True),
]
r = 4
for t, b in lines:
    put(rd, f'A{r}', t, bold=b)
    r += 1
heads = [
    ('Operating profit per month (Base)', f"='Monthly P&L'!C{P['op']}", GBP),
    ('Operating profit per year (Base)', f"='Monthly P&L'!C{P['year']}", GBP),
    ('Break-even transactions per day: Low / Base / High', f"=TEXT('Break-even'!B{B['be_d']},\"0\")&\" / \"&TEXT('Break-even'!C{B['be_d']},\"0\")&\" / \"&TEXT('Break-even'!D{B['be_d']},\"0\")", '@'),
    ('Planned transactions per day (Base)', f"='Break-even'!C{B['plan']}", NUM),
    ('Margin of safety (Base)', f"='Break-even'!C{B['mos']}", PCT),
    ('Lowest bank balance in the 13-week forecast (chosen scenario)', f"='Cash flow 13w'!B{Q['lowest']}", GBP),
]
for t, f, fmt in heads:
    put(rd, f'A{r}', t)
    put(rd, f'C{r}', f, fmt, color=GREEN, bold=True)
    r += 1
r += 1
for t, b in [
    ('Important', True),
    ('Every input is an assumption made without Bija\'s accounts. The £6.23 average transaction is a UK café benchmark, not Bija\'s figure.', False),
    ('VAT: standard rate 20%; registration threshold £90,000. Which sales are zero-rated (cold takeaway food, coffee beans) and whether your rent carries VAT must be confirmed with your accountant.', False),
    ('Records: HMRC requires business records (including VAT records) to be kept for at least 6 years. Keep the till Z-reports, supplier invoices and this model\'s inputs with them.', False),
    ('Sources for card fees: see docs/fullstack/pos-integration.md (checked 29 Oct 2026; prices change).', False),
]:
    put(rd, f'A{r}', t, bold=b)
    r += 1
rd.column_dimensions['A'].width = 62
rd.column_dimensions['B'].width = 4
rd.column_dimensions['C'].width = 22

# comments on the selector and key inputs
inp['C4'].comment = Comment('Choose Low, Base or High. Drives the 13-week cash flow.', 'Bija model')
inp[f'D{R["atv"]}'].comment = Comment('UK café benchmark £6.23 from the brief. Replace with Bija\'s till average.', 'Bija model')

for ws in wb.worksheets:
    ws.sheet_view.showGridLines = False
wb.save(OUT)
print('saved', OUT)
