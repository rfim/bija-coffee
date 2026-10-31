/*! Maheera panel v2.0.0 | the shared Maheera back-office panel for Kenduri members | https://rfim.github.io/maheera/embed/v2/maheera-panel.js
 *
 * A dependency-free web component, <maheera-panel>, that a restaurant embeds in its own staff backend.
 * It renders one Maheera Bundle v1 (see docs/embed.md) in a Shadow DOM, so no styles leak in or out.
 * The host supplies `load`, which calls the host's own Supabase function with the signed-in user's
 * token; the panel never sees a credential and never talks to Maheera itself.
 *
 *   MaheeraPanel.mount(el, { load: () => Promise<Bundle>, config?: Partial<UiConfig>, onError? })
 *   or: <maheera-panel></maheera-panel> with  el.load = () => fetch(...).then(r => r.json())
 *
 * This file is immutable once released: fixes that change behaviour ship as /embed/v3/.
 *
 * v2.0.0 (from v1.0.0): status chips wrap when they do not fit (a sentence such as "Batch 2026-w44 is short of
 * 2 ingredients", or a long custom label) instead of overflowing on phones without Inter. Nothing else changed.
 */
(function (root) {
  'use strict';

  var VERSION = '2.0.0';
  var CONFIG_VERSION = 1;
  var BUNDLE_VERSION = 1;
  var LOAD_TIMEOUT_MS = 20000;
  var SECTION_IDS = ['today', 'forecast', 'stock', 'menu', 'purchasing', 'insights'];
  var MODELS = ['cafe', 'preorder_kitchen', 'restaurant'];
  var HEX = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
  var LOCALE = /^[a-z]{2,3}(?:-[A-Z]{2})?$/;
  var CURRENCY = /^[A-Z]{3}$/;
  var PLAIN = /^[^\u0000-\u001F\u007F<>]*$/;   // plain text: no control characters, no angle brackets
  var LOGO_MAX = 49152;                          // characters of a logo URL or data URL (48 KB)

  // ---------- UiConfig v1: defaults, validation, merge ----------

  // Every string the panel shows. A restaurant can override any of them (e.g. kitchen -> bar).
  // {name} placeholders are filled from the data or, failing that, from other labels ({kitchen}, {dishes}).
  var DEFAULT_LABELS = {
    kitchen: 'kitchen',
    dish: 'dish',
    dishes: 'dishes',
    'section.today': 'Today',
    'section.forecast': 'Forecast & prep',
    'section.stock': 'Stock & reorder',
    'section.menu': 'Menu',
    'section.purchasing': 'Purchasing',
    'section.insights': 'Insights',
    'kpi.salesToday': 'Sales today',
    'kpi.orders': 'Orders',
    'kpi.avgOrder': 'Average order',
    'kpi.yesterday': 'Yesterday',
    'kpi.batchOrders': 'Batch orders',
    'kpi.batchValue': 'Batch value',
    'kpi.ready': 'Ready or collected',
    'kpi.margin': 'Gross margin yesterday',
    'kpi.usualByNow': 'Usual {weekday} by now: {amount}',
    'kpi.usualDay': 'Usual {weekday}: {amount}',
    'kpi.noUsual': 'Nothing to compare with yet',
    vsUsual: 'vs usual',
    'delta.above': '{pct}% above usual',
    'delta.below': '{pct}% below usual',
    'delta.same': 'In line',
    'delta.sameSr': 'In line with usual',
    'chart.hourly': 'Sales by hour',
    'chart.actual': 'Today',
    'chart.usual': 'Usual {weekday}',
    'batch.progress': 'Batch progress',
    'batch.closes': 'Closes {when}',
    'batch.none': 'No batch is open. When one opens, its orders and what to cook show here.',
    'status.new': 'New',
    'status.confirmed': 'Confirmed',
    'status.ready': 'Ready',
    'status.collected': 'Collected',
    attention: 'Needs attention',
    'attention.none': 'Nothing needs attention right now.',
    'forecast.title': 'Expected today',
    'forecast.batchTitle': 'To cook for batch {ref}',
    'forecast.source.maheera': 'Maheera forecast for today, with a likely range.',
    'forecast.source.baseline': 'Based on the last 4 weeks, adjusted for a usual {weekday}.',
    'forecast.source.batch': 'From the open orders in this batch. Ready orders are already done.',
    'forecast.expected': 'expected',
    'forecast.prep': 'prep {n}',
    'forecast.buy': 'To buy for this batch',
    'forecast.empty': 'No forecast yet. It appears once Maheera has a few weeks of sales.',
    'stock.reorder': 'Reorder now',
    'stock.reorderTotal': 'Estimated total {amount}',
    'stock.all': 'All stock',
    'stock.belowOnly': 'Below par only',
    'stock.par': 'par {par}',
    'stock.below': 'Below par',
    'stock.empty': 'No ingredients yet. Stock appears once ingredients are set up in Maheera.',
    'stock.reorderEmpty': 'Nothing to reorder: every ingredient with a par level is above it.',
    'menu.title': '{dishes} over the last {days} days',
    'menu.sold': '{n} sold',
    'menu.cost': 'cost {amount}',
    'menu.margin': '{pct}% margin',
    'menu.noRecipe': 'No recipe yet',
    'menu.class.star': 'Star',
    'menu.class.plowhorse': 'Plowhorse',
    'menu.class.puzzle': 'Puzzle',
    'menu.class.dog': 'Dog',
    'menu.legend': 'Star: popular and profitable. Plowhorse: popular, low margin. Puzzle: profitable, sells little. Dog: neither.',
    'menu.empty': 'No sales in the last 4 weeks yet.',
    'purchasing.title': 'Open purchase orders',
    'purchasing.due': 'Due {when}',
    'purchasing.overdue': 'Overdue since {when}',
    'purchasing.draft': 'Draft',
    'purchasing.sent': 'Sent',
    'purchasing.overdueTag': 'Overdue',
    'purchasing.dueTag': 'Due soon',
    'purchasing.empty': 'No open purchase orders.',
    'insights.empty': 'No insights yet. They appear as Maheera learns your {kitchen}.',
    'insights.go': 'Open {section}',
    'insights.region': 'What changed',
    'attention.open': 'Open',
    'insight.quiet': 'Nothing needs you right now',
    'insight.salesUp': 'Sales are {pct}% above a usual {weekday} so far',
    'insight.salesDown': 'Sales are {pct}% below a usual {weekday} so far',
    'insight.yesterdayUp': 'Yesterday was {pct}% above a usual {weekday}',
    'insight.yesterdayDown': 'Yesterday was {pct}% below a usual {weekday}',
    'insight.belowPar': '{n} ingredients are below par',
    'insight.belowPar.one': '1 ingredient is below par',
    'insight.belowPar.body': 'Reorder suggestions are ready in Stock & reorder.',
    'insight.poDue': '{n} deliveries due by tomorrow',
    'insight.poDue.one': '1 delivery due by tomorrow',
    'insight.poOverdue': '{n} deliveries are overdue',
    'insight.poOverdue.one': '1 delivery is overdue',
    'insight.noRecipe': '{n} {dishes} have no recipe',
    'insight.noRecipe.one': '1 {dish} has no recipe',
    'insight.noRecipe.body': 'Their cost and stock use are unknown until a recipe is added.',
    'insight.batchShort': 'Batch {ref} is short of {n} ingredients',
    'insight.batchShort.one': 'Batch {ref} is short of 1 ingredient',
    'insight.batchCloses': 'Batch {ref} closes {when} with {n} orders',
    'insight.batchCloses.one': 'Batch {ref} closes {when} with 1 order',
    'insight.star': '{name} is your star: popular and profitable',
    'insight.dog': '{name} sells little and earns little',
    'insight.dog.body': 'Consider reworking or retiring it.',
    'insight.incomplete': 'Gross profit is incomplete',
    'insight.incomplete.body': '{n} sale lines yesterday had no recipe or no item detail.',
    'insight.incomplete.body.one': '1 sale line yesterday had no recipe or no item detail.',
    loading: 'Loading Maheera…',
    'error.title': 'Maheera isn’t answering',
    'error.body': 'Your numbers couldn’t be loaded. Nothing in your {kitchen} is affected.',
    'error.retry': 'Try again',
    'error.next': 'Try again in a minute. If it keeps happening, tell your Maheera contact.',
    'error.forbidden': 'You don’t have access to Maheera here. Ask the owner if you should.',
    'error.version': 'This panel needs a newer Maheera function. Ask your developer to update it.',
    refresh: 'Refresh',
    updated: 'Updated {time}',
    today: 'today',
    tomorrow: 'tomorrow',
    yesterday: 'yesterday',
  };

  // UiConfig v1. Art direction: a restaurant keeps its own identity through its accent colour, logo, name
  // and words, while Maheera keeps the same layout, type, charts and status colours in every back office.
  // So the theme has only accent, density and mode; status colours, chart semantics, layout, fonts and
  // corner radius come from the design tokens and are not configurable.
  var BASE_DEFAULTS = {
    version: CONFIG_VERSION,
    theme: { accent: null, density: 'standard', mode: 'auto' },   // accent null: Maheera's own
    logo: null,
    display_name: null,
    sections: SECTION_IDS.map(function (id, i) { return { id: id, enabled: true, order: i }; }),
    labels: {},
    locale: 'en-GB',
    currency: 'GBP',
  };
  var DENSITY = { compact: 0.875, standard: 1, comfortable: 1.125 };
  var TOP_KEYS = ['version', 'theme', 'logo', 'display_name', 'sections', 'labels', 'locale', 'currency'];
  var NOT_CONFIGURABLE = 'not configurable: Maheera keeps the same type, shapes and status colours in every back office';

  // Built-in defaults per business model. These are the lowest layer of the precedence chain.
  var MODEL_DEFAULTS = {
    cafe: { labels: { dish: 'item', dishes: 'items' } },
    restaurant: {},
    preorder_kitchen: {
      sections: [
        { id: 'today', order: 0 }, { id: 'forecast', order: 1, title: 'Batch & prep' }, { id: 'stock', order: 2 },
        { id: 'purchasing', order: 3 }, { id: 'menu', order: 4 }, { id: 'insights', order: 5 },
      ],
    },
  };

  var clone = function (v) { return v == null ? v : JSON.parse(JSON.stringify(v)); };
  var isObj = function (v) { return v != null && typeof v === 'object' && !Array.isArray(v); };
  var has = function (o, k) { return Object.prototype.hasOwnProperty.call(o, k); };

  function expandHex(hex) {
    var h = hex.slice(1);
    if (h.length === 3) h = h.replace(/./g, function (c) { return c + c; });
    return '#' + h.toUpperCase();
  }

  // A logo is shown only as <img>, never as inline markup: an https URL, or a base64 PNG or SVG data URL.
  function validLogo(v) {
    return typeof v === 'string' && v.length <= LOGO_MAX &&
      (/^https:\/\/[^\s"'<>()\\]{3,500}$/.test(v) || /^data:image\/(?:png|svg\+xml);base64,[A-Za-z0-9+/]+={0,2}$/.test(v));
  }

  // Checks a partial UiConfig. Invalid fields are dropped (never half-applied) and reported, so a bad
  // value from any layer falls back to the layer below. Unknown keys are rejected.
  function validateConfig(input) {
    var warnings = [];
    var out = {};
    if (input == null) return { config: out, warnings: warnings };
    if (!isObj(input)) return { config: out, warnings: ['config: not an object, ignored'] };
    Object.keys(input).forEach(function (k) {
      if (TOP_KEYS.indexOf(k) < 0) warnings.push(k + ': unknown, ignored');
    });
    if (has(input, 'version') && input.version !== CONFIG_VERSION) warnings.push('version: expected ' + CONFIG_VERSION + ', read as ' + CONFIG_VERSION);

    if (has(input, 'theme')) {
      var t = input.theme;
      if (!isObj(t)) warnings.push('theme: not an object, ignored');
      else {
        var theme = {};
        if (has(t, 'accent')) {
          if (t.accent === null) theme.accent = null;
          else if (typeof t.accent === 'string' && HEX.test(t.accent)) theme.accent = expandHex(t.accent);
          else warnings.push('theme.accent: not a #RRGGBB colour, ignored');
        }
        if (has(t, 'density')) {
          if (has(DENSITY, t.density)) theme.density = t.density;
          else warnings.push('theme.density: use compact, standard or comfortable, ignored');
        }
        if (has(t, 'mode')) {
          if (['auto', 'light', 'dark'].indexOf(t.mode) >= 0) theme.mode = t.mode;
          else warnings.push('theme.mode: use auto, light or dark, ignored');
        }
        Object.keys(t).forEach(function (k) {
          if (['accent', 'density', 'mode'].indexOf(k) >= 0) return;
          warnings.push('theme.' + k + ': ' + (['accentText', 'radius', 'font'].indexOf(k) >= 0 ? NOT_CONFIGURABLE : 'unknown') + ', ignored');
        });
        out.theme = theme;
      }
    }

    if (has(input, 'logo')) {
      if (input.logo === null || validLogo(input.logo)) out.logo = input.logo;
      else warnings.push('logo: an https URL or a base64 PNG/SVG data URL up to ' + Math.round(LOGO_MAX / 1024) + ' KB, ignored');
    }
    if (has(input, 'display_name')) {
      if (input.display_name === null) out.display_name = null;
      else if (typeof input.display_name === 'string' && PLAIN.test(input.display_name) && input.display_name.trim() &&
        input.display_name.length <= 60) out.display_name = input.display_name.trim();
      else warnings.push('display_name: plain text up to 60 characters, ignored');
    }

    if (has(input, 'sections')) {
      if (!Array.isArray(input.sections)) warnings.push('sections: not a list, ignored');
      else {
        var seen = {};
        out.sections = [];
        input.sections.slice(0, 20).forEach(function (s, i) {
          if (!isObj(s) || SECTION_IDS.indexOf(s.id) < 0) { warnings.push('sections[' + i + ']: unknown section, ignored'); return; }
          var sec = { id: s.id };
          if (has(s, 'enabled')) {
            if (typeof s.enabled === 'boolean') sec.enabled = s.enabled;
            else warnings.push('sections[' + i + '].enabled: not true/false, ignored');
          }
          if (has(s, 'order')) {
            var o = Number(s.order);
            if (s.order === null || !isFinite(o)) warnings.push('sections[' + i + '].order: not a number, ignored');
            else sec.order = Math.round(Math.min(99, Math.max(0, o)));
          }
          if (has(s, 'title')) {
            if (s.title === null || s.title === '') sec.title = null;
            else if (typeof s.title === 'string' && s.title.trim().length <= 40 && PLAIN.test(s.title)) sec.title = s.title.trim();
            else warnings.push('sections[' + i + '].title: up to 40 characters, ignored');
          }
          if (seen[s.id] != null) out.sections[seen[s.id]] = Object.assign(out.sections[seen[s.id]], sec);
          else { seen[s.id] = out.sections.length; out.sections.push(sec); }
        });
      }
    }

    if (has(input, 'labels')) {
      if (!isObj(input.labels)) warnings.push('labels: not an object, ignored');
      else {
        out.labels = {};
        Object.keys(input.labels).forEach(function (k) {
          var v = input.labels[k];
          if (!has(DEFAULT_LABELS, k)) warnings.push('labels.' + k + ': unknown label, ignored');
          else if (typeof v !== 'string' || !v.trim() || v.length > 120 || !PLAIN.test(v)) warnings.push('labels.' + k + ': plain text of 1–120 characters, ignored');
          else out.labels[k] = v;
        });
      }
    }

    if (has(input, 'locale')) {
      var okLocale = typeof input.locale === 'string' && LOCALE.test(input.locale);
      try { okLocale = okLocale && Intl.NumberFormat.supportedLocalesOf([input.locale]).length > 0; } catch (e) { okLocale = false; }
      if (okLocale) out.locale = input.locale;
      else warnings.push('locale: not a supported locale such as en-GB, ignored');
    }
    if (has(input, 'currency')) {
      if (typeof input.currency === 'string' && CURRENCY.test(input.currency)) out.currency = input.currency;
      else warnings.push('currency: use a 3-letter code such as GBP, ignored');
    }
    return { config: out, warnings: warnings };
  }

  // Layers later in the list win. theme and labels merge by key; sections merge by id.
  function mergeConfig() {
    var out = clone(BASE_DEFAULTS);
    for (var i = 0; i < arguments.length; i++) {
      var layer = arguments[i];
      if (!isObj(layer)) continue;
      if (isObj(layer.theme)) out.theme = Object.assign(out.theme, layer.theme);
      if (isObj(layer.labels)) out.labels = Object.assign(out.labels, layer.labels);
      if (Array.isArray(layer.sections)) {
        layer.sections.forEach(function (s) {
          var cur = out.sections.filter(function (x) { return x.id === s.id; })[0];
          if (cur) Object.assign(cur, s);
        });
      }
      if (has(layer, 'logo')) out.logo = layer.logo;
      if (has(layer, 'display_name')) out.display_name = layer.display_name;
      if (layer.locale) out.locale = layer.locale;
      if (layer.currency) out.currency = layer.currency;
    }
    out.version = CONFIG_VERSION;
    out.sections.sort(function (a, b) { return a.order - b.order || SECTION_IDS.indexOf(a.id) - SECTION_IDS.indexOf(b.id); });
    return out;
  }

  // ---- generated by test/embed/build-panel.mjs from site/shared (tokens, accent.js, mark, contours): do not edit ----
  var TOKENS_CSS = ".mh {\n  --mh-space-1: 4px;\n  --mh-space-xxs: 4px;\n  --mh-space-2: 8px;\n  --mh-space-xs: 8px;\n  --mh-space-3: 12px;\n  --mh-space-sm: 12px;\n  --mh-space-4: 16px;\n  --mh-space-md: 16px;\n  --mh-space-5: 24px;\n  --mh-space-lg: 24px;\n  --mh-space-6: 32px;\n  --mh-space-xl: 32px;\n  --mh-space-7: 48px;\n  --mh-space-xxl: 48px;\n  --mh-radius-sm: 6px;\n  --mh-radius-md: 10px;\n  --mh-radius-lg: 14px;\n  --mh-radius-pill: 999px;\n  --mh-radius: 10px;\n  --mh-type-caption-size: 12px;\n  --mh-type-caption-line: 16px;\n  --mh-type-caption-weight: 500;\n  --mh-type-small-size: 13px;\n  --mh-type-small-line: 18px;\n  --mh-type-small-weight: 400;\n  --mh-type-body-size: 14px;\n  --mh-type-body-line: 22px;\n  --mh-type-body-weight: 400;\n  --mh-type-lead-size: 16px;\n  --mh-type-lead-line: 24px;\n  --mh-type-lead-weight: 500;\n  --mh-type-h-3-size: 18px;\n  --mh-type-h-3-line: 26px;\n  --mh-type-h-3-weight: 600;\n  --mh-type-h-2-size: 24px;\n  --mh-type-h-2-line: 32px;\n  --mh-type-h-2-weight: 600;\n  --mh-type-kpi-size: 28px;\n  --mh-type-kpi-line: 34px;\n  --mh-type-kpi-weight: 600;\n  --mh-type-display-size: 34px;\n  --mh-type-display-line: 40px;\n  --mh-type-display-weight: 600;\n  --mh-size-control: 36px;\n  --mh-size-tap: 44px;\n  --mh-size-topbar: 64px;\n  --mh-size-sider: 240px;\n  --mh-size-sider-collapsed: 72px;\n  --mh-size-tabbar: 56px;\n  --mh-size-icon: 16px;\n  --mh-size-insight-icon: 32px;\n  --mh-size-empty-icon: 44px;\n  --mh-size-spark-width: 104px;\n  --mh-size-spark-height: 32px;\n  --mh-size-chart-height: 240px;\n  --mh-size-focus-ring: 2px;\n  --mh-font: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;\n  --mh-font-brand: Fraunces, 'Iowan Old Style', Georgia, serif;\n  --mh-font-code: ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace;\n  --mh-density: 1;\n  --mh-bg: #FAF8F5;\n  --mh-surface: #FFFFFF;\n  --mh-sunken: #F5F2ED;\n  --mh-border: #E6E1D9;\n  --mh-border-strong: #C9C2B6;\n  --mh-text: #1C1F26;\n  --mh-text-2: #474B55;\n  --mh-text-3: #5E626D;\n  --mh-primary: #2F3E9E;\n  --mh-primary-fill: #2F3E9E;\n  --mh-on-primary: #FFFFFF;\n  --mh-primary-subtle: #ECEEFA;\n  --mh-accent: #E0A526;\n  --mh-on-accent: #1C1F26;\n  --mh-info: #2F3E9E;\n  --mh-info-subtle: #ECEEFA;\n  --mh-good: #2E7D4F;\n  --mh-good-subtle: #EEF7F1;\n  --mh-bad: #C0392B;\n  --mh-bad-subtle: #FBEBE9;\n  --mh-warn: #B7791F;\n  --mh-warn-text: #8F5E12;\n  --mh-warn-subtle: #FBF1E0;\n  --mh-neutral-subtle: #F0EDE8;\n  --mh-chart-accent: #2F3E9E;\n  --mh-chart-accent-muted: #B7BEE6;\n  --mh-chart-expected: #6B6F7A;\n  --mh-chart-band: rgba(107, 111, 122, 0.16);\n  --mh-chart-grid: #ECE8E1;\n  --mh-sider-bg: #FFFFFF;\n  --mh-shadow: 0 1px 2px rgba(28, 31, 38, 0.05);\n  --mh-shadow-raised: 0 8px 24px rgba(28, 31, 38, 0.10);\n  color-scheme: light;\n}\n\n.mh[data-mh-theme=\"dark\"] {\n  --mh-bg: #14171F;\n  --mh-surface: #1A1E28;\n  --mh-sunken: #222734;\n  --mh-border: #2C3240;\n  --mh-border-strong: #3D4454;\n  --mh-text: #ECEEF3;\n  --mh-text-2: #B8BDC9;\n  --mh-text-3: #969CAA;\n  --mh-primary: #9AA6F0;\n  --mh-primary-fill: #9AA6F0;\n  --mh-on-primary: #14171F;\n  --mh-primary-subtle: rgba(154, 166, 240, 0.16);\n  --mh-accent: #E0A526;\n  --mh-on-accent: #14171F;\n  --mh-info: #9AA6F0;\n  --mh-info-subtle: rgba(154, 166, 240, 0.16);\n  --mh-good: #5FBF86;\n  --mh-good-subtle: rgba(95, 191, 134, 0.14);\n  --mh-bad: #F07A6C;\n  --mh-bad-subtle: rgba(240, 122, 108, 0.14);\n  --mh-warn: #E0A24A;\n  --mh-warn-text: #E0A24A;\n  --mh-warn-subtle: rgba(224, 162, 74, 0.14);\n  --mh-neutral-subtle: #262B38;\n  --mh-chart-accent: #9AA6F0;\n  --mh-chart-accent-muted: #4A5384;\n  --mh-chart-expected: #A0A6B4;\n  --mh-chart-band: rgba(160, 166, 180, 0.18);\n  --mh-chart-grid: #272C38;\n  --mh-sider-bg: #171A23;\n  --mh-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);\n  --mh-shadow-raised: 0 8px 24px rgba(0, 0, 0, 0.5);\n  color-scheme: dark;\n}\n\n@media (prefers-color-scheme: dark) {\n  .mh:not([data-mh-theme=\"light\"]) {\n    --mh-bg: #14171F;\n    --mh-surface: #1A1E28;\n    --mh-sunken: #222734;\n    --mh-border: #2C3240;\n    --mh-border-strong: #3D4454;\n    --mh-text: #ECEEF3;\n    --mh-text-2: #B8BDC9;\n    --mh-text-3: #969CAA;\n    --mh-primary: #9AA6F0;\n    --mh-primary-fill: #9AA6F0;\n    --mh-on-primary: #14171F;\n    --mh-primary-subtle: rgba(154, 166, 240, 0.16);\n    --mh-accent: #E0A526;\n    --mh-on-accent: #14171F;\n    --mh-info: #9AA6F0;\n    --mh-info-subtle: rgba(154, 166, 240, 0.16);\n    --mh-good: #5FBF86;\n    --mh-good-subtle: rgba(95, 191, 134, 0.14);\n    --mh-bad: #F07A6C;\n    --mh-bad-subtle: rgba(240, 122, 108, 0.14);\n    --mh-warn: #E0A24A;\n    --mh-warn-text: #E0A24A;\n    --mh-warn-subtle: rgba(224, 162, 74, 0.14);\n    --mh-neutral-subtle: #262B38;\n    --mh-chart-accent: #9AA6F0;\n    --mh-chart-accent-muted: #4A5384;\n    --mh-chart-expected: #A0A6B4;\n    --mh-chart-band: rgba(160, 166, 180, 0.18);\n    --mh-chart-grid: #272C38;\n    --mh-sider-bg: #171A23;\n    --mh-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);\n    --mh-shadow-raised: 0 8px 24px rgba(0, 0, 0, 0.5);\n    color-scheme: dark;\n  }\n}";
  var MARK_PATHS = ["M4.5 14.5C4.5 8 8 3.4 12 2.6c4 .8 7.5 5.4 7.5 11.9","M2.5 14.5h19","M8 14.5v6.5M16 14.5v6.5M6.5 18h11"];
  var CONTOURS_URL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NDAgMzIwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBhcmlhLWhpZGRlbj0idHJ1ZSI+IDxwYXRoIGQ9Ik0wIDE4LjAgUTIwIDE4LjAgMjAgMjEuOSBRNjAgMjUuNyA2MCAyNy41IFExMDAgMjkuMyAxMDAgMjguNCBRMTQwIDI3LjYgMTQwIDI1LjUgUTE4MCAyMy41IDE4MCAyMi4zIFEyMjAgMjEuMCAyMjAgMjEuMiBRMjYwIDIxLjUgMjYwIDIyLjIgUTMwMCAyMi45IDMwMCAyMi4yIFEzNDAgMjEuNiAzNDAgMTguOSBRMzgwIDE2LjEgMzgwIDEyLjUgUTQyMCA4LjkgNDIwIDYuNiBRNDYwIDQuMyA0NjAgNC45IFE1MDAgNS41IDUwMCA4LjQgUTU0MCAxMS40IDU0MCAxNC43IFE1ODAgMTguMCA1ODAgMTkuOCBRNjIwIDIxLjUgNjIwIDIxLjQgVDY0MCAyMS4zIi8+IDxwYXRoIGQ9Ik0wIDU1LjUgUTIwIDU1LjUgMjAgNTYuNCBRNjAgNTcuMiA2MCA1NS43IFExMDAgNTQuMyAxMDAgNTIuMyBRMTQwIDUwLjQgMTQwIDQ5LjYgUTE4MCA0OC45IDE4MCA0OS40IFEyMjAgNTAuMCAyMjAgNTAuNSBRMjYwIDUwLjkgMjYwIDQ5LjUgUTMwMCA0OC4yIDMwMCA0NS4wIFEzNDAgNDEuNyAzNDAgMzguMyBRMzgwIDM0LjkgMzgwIDMzLjQgUTQyMCAzMi4wIDQyMCAzMy41IFE0NjAgMzUuMSA0NjAgMzguNCBRNTAwIDQxLjggNTAwIDQ0LjcgUTU0MCA0Ny43IDU0MCA0OC43IFE1ODAgNDkuOCA1ODAgNDkuMyBRNjIwIDQ4LjggNjIwIDQ4LjUgVDY0MCA0OC4yIi8+IDxwYXRoIGQ9Ik0wIDg0LjYgUTIwIDg0LjYgMjAgODIuNyBRNjAgODAuOSA2MCA3OS4yIFExMDAgNzcuNSAxMDAgNzcuMyBRMTQwIDc3LjEgMTQwIDc3LjggUTE4MCA3OC41IDE4MCA3OC41IFEyMjAgNzguNSAyMjAgNzYuNCBRMjYwIDc0LjQgMjYwIDcwLjggUTMwMCA2Ny4yIDMwMCA2NC4zIFEzNDAgNjEuMyAzNDAgNjAuOCBRMzgwIDYwLjQgMzgwIDYyLjggUTQyMCA2NS4xIDQyMCA2OC42IFE0NjAgNzIuMCA0NjAgNzQuNCBRNTAwIDc2LjggNTAwIDc3LjIgUTU0MCA3Ny43IDU0MCA3Ny4wIFE1ODAgNzYuNCA1ODAgNzYuNSBRNjIwIDc2LjYgNjIwIDc4LjIgVDY0MCA3OS45Ii8+IDxwYXRoIGQ9Ik0wIDEwNy41IFEyMCAxMDcuNSAyMCAxMDYuMyBRNjAgMTA1LjAgNjAgMTA1LjIgUTEwMCAxMDUuNSAxMDAgMTA2LjIgUTE0MCAxMDYuOSAxNDAgMTA2LjIgUTE4MCAxMDUuNiAxODAgMTAyLjkgUTIyMCAxMDAuMiAyMjAgOTYuNSBRMjYwIDkyLjkgMjYwIDkwLjYgUTMwMCA4OC4zIDMwMCA4OC45IFEzNDAgODkuNSAzNDAgOTIuNCBRMzgwIDk1LjQgMzgwIDk4LjcgUTQyMCAxMDIuMCA0MjAgMTAzLjggUTQ2MCAxMDUuNSA0NjAgMTA1LjQgUTUwMCAxMDUuMyA1MDAgMTA0LjcgUTU0MCAxMDQuMSA1NDAgMTA0LjggUTU4MCAxMDUuNCA1ODAgMTA3LjQgUTYyMCAxMDkuNCA2MjAgMTExLjQgVDY0MCAxMTMuNCIvPiA8cGF0aCBkPSJNMCAxMzIuOSBRMjAgMTMyLjkgMjAgMTMzLjQgUTYwIDEzNC4wIDYwIDEzNC40IFExMDAgMTM0LjkgMTAwIDEzMy41IFExNDAgMTMyLjIgMTQwIDEyOS4wIFExODAgMTI1LjcgMTgwIDEyMi4zIFEyMjAgMTE4LjkgMjIwIDExNy40IFEyNjAgMTE2LjAgMjYwIDExNy41IFEzMDAgMTE5LjEgMzAwIDEyMi40IFEzNDAgMTI1LjggMzQwIDEyOC43IFEzODAgMTMxLjcgMzgwIDEzMi43IFE0MjAgMTMzLjggNDIwIDEzMy4zIFE0NjAgMTMyLjggNDYwIDEzMi41IFE1MDAgMTMyLjIgNTAwIDEzMy4zIFE1NDAgMTM0LjUgNTQwIDEzNi43IFE1ODAgMTM5LjAgNTgwIDE0MC41IFE2MjAgMTQxLjkgNjIwIDE0MC45IFQ2NDAgMTM5LjkiLz4gPHBhdGggZD0iTTAgMTYyLjUgUTIwIDE2Mi41IDIwIDE2Mi41IFE2MCAxNjIuNSA2MCAxNjAuNCBRMTAwIDE1OC40IDEwMCAxNTQuOCBRMTQwIDE1MS4zIDE0MCAxNDguMyBRMTgwIDE0NS4zIDE4MCAxNDQuOCBRMjIwIDE0NC40IDIyMCAxNDYuOCBRMjYwIDE0OS4xIDI2MCAxNTIuNiBRMzAwIDE1Ni4wIDMwMCAxNTguNCBRMzQwIDE2MC44IDM0MCAxNjEuMyBRMzgwIDE2MS43IDM4MCAxNjEuMCBRNDIwIDE2MC40IDQyMCAxNjAuNSBRNDYwIDE2MC42IDQ2MCAxNjIuMiBRNTAwIDE2My45IDUwMCAxNjYuMSBRNTQwIDE2OC4zIDU0MCAxNjkuMSBRNTgwIDE2OS45IDU4MCAxNjcuOSBRNjIwIDE2Ni4wIDYyMCAxNjIuMSBUNjQwIDE1OC4xIi8+IDxwYXRoIGQ9Ik0wIDE4OS42IFEyMCAxODkuNiAyMCAxODYuOSBRNjAgMTg0LjIgNjAgMTgwLjUgUTEwMCAxNzYuOSAxMDAgMTc0LjYgUTE0MCAxNzIuMyAxNDAgMTcyLjkgUTE4MCAxNzMuNCAxODAgMTc2LjQgUTIyMCAxNzkuNCAyMjAgMTgyLjcgUTI2MCAxODYuMCAyNjAgMTg3LjggUTMwMCAxODkuNSAzMDAgMTg5LjQgUTM0MCAxODkuMyAzNDAgMTg4LjcgUTM4MCAxODguMiAzODAgMTg4LjggUTQyMCAxODkuNCA0MjAgMTkxLjQgUTQ2MCAxOTMuNCA0NjAgMTk1LjQgUTUwMCAxOTcuNCA1MDAgMTk3LjMgUTU0MCAxOTcuMiA1NDAgMTk0LjQgUTU4MCAxOTEuNiA1ODAgMTg3LjUgUTYyMCAxODMuMyA2MjAgMTgwLjEgVDY0MCAxNzcuMCIvPiA8cGF0aCBkPSJNMCAyMDkuNyBRMjAgMjA5LjcgMjAgMjA2LjMgUTYwIDIwMi45IDYwIDIwMS40IFExMDAgMjAwLjAgMTAwIDIwMS41IFExNDAgMjAzLjEgMTQwIDIwNi40IFExODAgMjA5LjggMTgwIDIxMi43IFEyMjAgMjE1LjcgMjIwIDIxNi43IFEyNjAgMjE3LjggMjYwIDIxNy4zIFEzMDAgMjE2LjggMzAwIDIxNi41IFEzNDAgMjE2LjIgMzQwIDIxNy4zIFEzODAgMjE4LjUgMzgwIDIyMC43IFE0MjAgMjIzLjAgNDIwIDIyNC40IFE0NjAgMjI1LjkgNDYwIDIyNC45IFE1MDAgMjIzLjkgNTAwIDIyMC40IFE1NDAgMjE2LjkgNTQwIDIxMi44IFE1ODAgMjA4LjggNTgwIDIwNi4zIFE2MjAgMjAzLjkgNjIwIDIwNC4xIFQ2NDAgMjA0LjMiLz4gPHBhdGggZD0iTTAgMjI5LjMgUTIwIDIyOS4zIDIwIDIyOC44IFE2MCAyMjguNCA2MCAyMzAuNyBRMTAwIDIzMy4xIDEwMCAyMzYuNiBRMTQwIDI0MC4wIDE0MCAyNDIuNCBRMTgwIDI0NC44IDE4MCAyNDUuMyBRMjIwIDI0NS43IDIyMCAyNDUuMSBRMjYwIDI0NC40IDI2MCAyNDQuNSBRMzAwIDI0NC42IDMwMCAyNDYuMiBRMzQwIDI0Ny45IDM0MCAyNTAuMSBRMzgwIDI1Mi4zIDM4MCAyNTMuMSBRNDIwIDI1My45IDQyMCAyNTEuOSBRNDYwIDI1MC4wIDQ2MCAyNDYuMSBRNTAwIDI0Mi4xIDUwMCAyMzguNCBRNTQwIDIzNC42IDU0MCAyMzMuMCBRNTgwIDIzMS41IDU4MCAyMzIuNCBRNjIwIDIzMy4zIDYyMCAyMzUuMCBUNjQwIDIzNi44Ii8+IDxwYXRoIGQ9Ik0wIDI1Ny40IFEyMCAyNTcuNCAyMCAyNjAuNCBRNjAgMjYzLjQgNjAgMjY2LjcgUTEwMCAyNzAuMCAxMDAgMjcxLjggUTE0MCAyNzMuNSAxNDAgMjczLjQgUTE4MCAyNzMuMyAxODAgMjcyLjcgUTIyMCAyNzIuMiAyMjAgMjcyLjggUTI2MCAyNzMuNCAyNjAgMjc1LjQgUTMwMCAyNzcuNCAzMDAgMjc5LjQgUTM0MCAyODEuNCAzNDAgMjgxLjMgUTM4MCAyODEuMiAzODAgMjc4LjQgUTQyMCAyNzUuNiA0MjAgMjcxLjUgUTQ2MCAyNjcuMyA0NjAgMjY0LjEgUTUwMCAyNjEuMCA1MDAgMjYwLjMgUTU0MCAyNTkuNiA1NDAgMjYxLjAgUTU4MCAyNjIuNSA1ODAgMjY0LjEgUTYyMCAyNjUuOCA2MjAgMjY2LjEgVDY0MCAyNjYuNCIvPiA8cGF0aCBkPSJNMCAyOTMuOCBRMjAgMjkzLjggMjAgMjk2LjcgUTYwIDI5OS43IDYwIDMwMC43IFExMDAgMzAxLjggMTAwIDMwMS4zIFExNDAgMzAwLjkgMTQwIDMwMC41IFExODAgMzAwLjIgMTgwIDMwMS4zIFEyMjAgMzAyLjUgMjIwIDMwNC43IFEyNjAgMzA3LjAgMjYwIDMwOC40IFEzMDAgMzA5LjkgMzAwIDMwOC45IFEzNDAgMzA3LjkgMzQwIDMwNC40IFEzODAgMzAxLjAgMzgwIDI5Ni45IFE0MjAgMjkyLjggNDIwIDI5MC4zIFE0NjAgMjg3LjkgNDYwIDI4OC4xIFE1MDAgMjg4LjMgNTAwIDI5MC4wIFE1NDAgMjkxLjcgNTQwIDI5My4wIFE1ODAgMjk0LjMgNTgwIDI5NC4yIFE2MjAgMjk0LjAgNjIwIDI5My4yIFQ2NDAgMjkyLjMiLz4gPC9zdmc+";
  var MH = (function () {
    const palette = {"light":{"bg":"#FAF8F5","surface":"#FFFFFF","sunken":"#F5F2ED","border":"#E6E1D9","borderStrong":"#C9C2B6","text":"#1C1F26","text2":"#474B55","text3":"#5E626D","primary":"#2F3E9E","primaryFill":"#2F3E9E","onPrimary":"#FFFFFF","primarySubtle":"#ECEEFA","accent":"#E0A526","onAccent":"#1C1F26","info":"#2F3E9E","infoSubtle":"#ECEEFA","good":"#2E7D4F","goodSubtle":"#EEF7F1","bad":"#C0392B","badSubtle":"#FBEBE9","warn":"#B7791F","warnText":"#8F5E12","warnSubtle":"#FBF1E0","neutralSubtle":"#F0EDE8","chartAccent":"#2F3E9E","chartAccentMuted":"#B7BEE6","chartExpected":"#6B6F7A","chartBand":"rgba(107, 111, 122, 0.16)","chartGrid":"#ECE8E1","siderBg":"#FFFFFF","shadow":"0 1px 2px rgba(28, 31, 38, 0.05)","shadowRaised":"0 8px 24px rgba(28, 31, 38, 0.10)"},"dark":{"bg":"#14171F","surface":"#1A1E28","sunken":"#222734","border":"#2C3240","borderStrong":"#3D4454","text":"#ECEEF3","text2":"#B8BDC9","text3":"#969CAA","primary":"#9AA6F0","primaryFill":"#9AA6F0","onPrimary":"#14171F","primarySubtle":"rgba(154, 166, 240, 0.16)","accent":"#E0A526","onAccent":"#14171F","info":"#9AA6F0","infoSubtle":"rgba(154, 166, 240, 0.16)","good":"#5FBF86","goodSubtle":"rgba(95, 191, 134, 0.14)","bad":"#F07A6C","badSubtle":"rgba(240, 122, 108, 0.14)","warn":"#E0A24A","warnText":"#E0A24A","warnSubtle":"rgba(224, 162, 74, 0.14)","neutralSubtle":"#262B38","chartAccent":"#9AA6F0","chartAccentMuted":"#4A5384","chartExpected":"#A0A6B4","chartBand":"rgba(160, 166, 180, 0.18)","chartGrid":"#272C38","siderBg":"#171A23","shadow":"0 1px 2px rgba(0, 0, 0, 0.4)","shadowRaised":"0 8px 24px rgba(0, 0, 0, 0.5)"}};
    // A restaurant's own colour inside Maheera, with an automatic WCAG AA fallback. No dependencies and no
    // DOM, so the operator app, the embeddable panel (site/embed), the morning email and the tests all use
    // the same maths.
    //
    //   accentTokens('#C2331C', 'light')  →  { primary, primaryFill, onPrimary, primarySubtle, accent, onAccent,
    //                                          chartAccent, chartAccentMuted, chartsKept, adjusted: [...] }
    //
    // The restaurant's colour dresses the CHROME: buttons, links, selected navigation, the mark.
    //   primary       links, focus, selected nav text      ≥ 4.5:1 on bg, surface, sunken and primarySubtle
    //   primaryFill   filled buttons, with onPrimary text  ≥ 4.5:1 (white, or ink when the colour is light)
    //   accent        markers and small fills              ≥ 2:1 on the surface
    // Charts and status stay Maheera's (accentRole 'chrome') when the colour is within about 30° of hue of
    // good or bad (it would read as status), too grey to stand out as a series (near-black, greys), or
    // under 3:1 on the surface; otherwise accentRole is 'chrome-and-charts'. `reason` says why, `adjusted`
    // lists what had to change. Status colours (info, good, bad, warn) are never replaced.

    function parse(c) {
      if (c.startsWith('#')) {
        let h = c.slice(1);
        if (h.length === 3) h = [...h].map(x => x + x).join('');
        return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)).concat(1);
      }
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) throw new Error(`Cannot read colour ${c}`);
      const [r, g, b, a = 1] = m[1].split(',').map(Number);
      return [r, g, b, a];
    }
    const hex = ([r, g, b]) => `#${[r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
    // Composite a (possibly translucent) colour over an opaque background.
    const over = (fg, bg) => fg.slice(0, 3).map((v, i) => v * fg[3] + bg[i] * (1 - fg[3])).concat(1);
    const mix = (a, b, t) => a.slice(0, 3).map((v, i) => v + (b[i] - v) * t).concat(1);

    function luminance([r, g, b]) {
      return [r, g, b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; })
        .reduce((acc, v, i) => acc + v * [0.2126, 0.7152, 0.0722][i], 0);
    }
    // WCAG contrast ratio between two colours (strings or [r, g, b, a]); translucency is composited over `base`.
    function contrast(fg, bg, base = '#FFFFFF') {
      const B = over(typeof bg === 'string' ? parse(bg) : bg, parse(base));
      const F = over(typeof fg === 'string' ? parse(fg) : fg, B);
      const [l1, l2] = [luminance(F), luminance(B)].sort((a, b) => b - a);
      return (l1 + 0.05) / (l2 + 0.05);
    }

    // Move `c` towards black or white until it reaches `min` against every background.
    function enforce(c, bgs, min, toward) {
      const target = parse(toward);
      for (let t = 0; t <= 1.0001; t += 0.02) {
        const x = parse(hex(mix(c, target, t)));            // round first, so the hex we hand out passes too
        if (bgs.every(bg => contrast(x, bg) >= min + 0.02)) return { color: x, changed: t > 0 };
      }
      return { color: target, changed: true };
    }

    // Hue in degrees and saturation 0–1, enough to tell "reads as red or green".
    function hueSat([r, g, b]) {
      const [R, G, B] = [r / 255, g / 255, b / 255];
      const max = Math.max(R, G, B); const min = Math.min(R, G, B); const d = max - min;
      if (d === 0) return { h: 0, s: 0 };
      const l = (max + min) / 2;
      const s = d / (1 - Math.abs(2 * l - 1));
      let h = max === R ? ((G - B) / d) % 6 : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
      h *= 60; if (h < 0) h += 360;
      return { h, s };
    }
    const hueGap = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
    // Within about 30° of hue of Maheera's own good or bad colour, so it would read as status.
    function readsAsStatus(color) {
      const { h, s } = hueSat(parse(color));
      if (s < 0.12) return null;
      if (hueGap(h, hueSat(parse(palette.light.bad)).h) <= 30) return 'red';
      if (hueGap(h, hueSat(parse(palette.light.good)).h) <= 30) return 'green';
      return null;
    }
    // Too little colour to stand out as the one coloured series among grey charts (near-black, greys).
    const tooGrey = color => hueSat(parse(color)).s < 0.12;

    function accentTokens(color, mode = 'light') {
      const p = palette[mode];
      const dark = mode === 'dark';
      const toward = dark ? '#FFFFFF' : '#000000';
      const base = parse(color);
      const surface = parse(p.surface);
      const surfaces = [p.bg, p.surface, p.sunken].map(parse);
      const adjusted = [];
      const ink = parse(palette.light.text);
      const bestOn = c => (contrast('#FFFFFF', c) >= contrast(ink, c) ? '#FFFFFF' : palette.light.text);

      const subtle = dark ? over([...base.slice(0, 3), 0.16], surface) : mix(base, parse('#FFFFFF'), 0.9);
      const t = enforce(base, [...surfaces, subtle], 4.5, toward);
      if (t.changed) adjusted.push('primary');

      // Filled controls keep the colour when white or ink reads on it; otherwise it is deepened (or lifted).
      let fill = base; let on = bestOn(base);
      if (contrast(on, base) < 4.5) {
        fill = enforce(base, [parse(on)], 4.5, on === '#FFFFFF' ? '#000000' : '#FFFFFF').color;
        adjusted.push('primaryFill');
      }

      let m = enforce(base, [surface], 2, toward);
      if (contrast(bestOn(m.color), m.color) < 4.5) m = { color: enforce(m.color, [parse('#FFFFFF')], 4.5, '#000000').color, changed: true };
      if (m.changed) adjusted.push('accent');

      const status = readsAsStatus(color);
      const reason = status ? `reads as ${status}` : tooGrey(color) ? 'too grey to read as a series'
        : contrast(base, surface) < 3 ? 'under 3:1 on the surface' : null;
      const chart = reason ? parse(p.chartAccent) : base;

      return {
        primary: hex(t.color),
        primaryFill: hex(fill),
        onPrimary: on,
        primarySubtle: hex(subtle),
        accent: hex(m.color),
        onAccent: bestOn(m.color),
        chartAccent: hex(chart),
        chartAccentMuted: hex(mix(chart, surface, 0.55)),
        accentRole: reason ? 'chrome' : 'chrome-and-charts',   // what the colour styles
        reason,                                                // why charts stay Maheera's, or null
        chartsKept: reason ?? false,
        adjusted,
      };
    }

    // CSS custom properties for an accent override, ready for element.style.setProperty.
    function accentVariables(accent, mode = 'light') {
      const a = accentTokens(accent, mode);
      return {
        '--mh-primary': a.primary, '--mh-primary-fill': a.primaryFill, '--mh-on-primary': a.onPrimary, '--mh-primary-subtle': a.primarySubtle,
        '--mh-accent': a.accent, '--mh-on-accent': a.onAccent, '--mh-chart-accent': a.chartAccent, '--mh-chart-accent-muted': a.chartAccentMuted,
      };
    }
    return { palette: palette, accentTokens: accentTokens, accentVariables: accentVariables, contrast: contrast, parse: parse, hex: hex };
  })();
  // ---- end of generated tokens ----

  // ---------- the restaurant's accent ----------
  // Rule (art direction), implemented once in the design system's accent.js: the restaurant's colour dresses
  // the chrome only (header, logo area, selected tab, focus ring, links, primary button). Charts keep
  // Maheera's own chart colour when the colour reads as a status (within about 30° of good or bad), is too
  // grey to read as a series, or is under 3:1 on the surface; status colours are never replaced. Every
  // accent is worked out separately for light and dark.
  var MODES = ['light', 'dark'];
  var REASON_TEXT = {
    'reads as red': 'reads as the red Maheera uses for problems',
    'reads as green': 'reads as the green Maheera uses for good news',
    'too grey to read as a series': 'is too close to black, white or grey to stand out in a chart',
    'under 3:1 on the surface': 'is too faint on the background to read in a chart',
  };

  // The CSS variables one accent sets in one mode (accentVariables: chrome, the gold accent and charts; never
  // a neutral or a status colour), and whether charts use it.
  function accentTheme(accent, mode) {
    if (!accent) return { vars: {}, charts: 'maheera', reason: null, explain: null, adjusted: [] };
    var t = MH.accentTokens(accent, mode);
    return {
      vars: MH.accentVariables(accent, mode),
      charts: t.chartsKept ? 'maheera' : 'accent',
      reason: t.reason,
      explain: t.reason ? (REASON_TEXT[t.reason] || t.reason) : null,
      adjusted: t.adjusted,
    };
  }

  // Style rules for an accent in both modes, keyed the same way as the tokens (data-mh-theme or the device).
  function themeCss(accent) {
    if (!accent) return '';
    var block = function (sel, vars) {
      return sel + '{' + Object.keys(vars).map(function (k) { return k + ':' + vars[k]; }).join(';') + '}';
    };
    var light = accentTheme(accent, 'light').vars, dark = accentTheme(accent, 'dark').vars;
    return block('.mh', light) + block('.mh[data-mh-theme="dark"]', dark) +
      '@media (prefers-color-scheme:dark){' + block('.mh:not([data-mh-theme="light"])', dark) + '}';
  }

  function defaultsFor(businessModel) {
    return mergeConfig(MODEL_DEFAULTS[businessModel] || {});
  }

  // Precedence: built-in defaults for the business model < the restaurant's config stored in Maheera
  // (bundle.ui) < the host's `config` passed to mount. Then the accent is checked in light and dark;
  // `warnings` says what the panel adjusted and where charts keep Maheera's colour.
  function resolveConfig(opts) {
    opts = opts || {};
    var stored = validateConfig(opts.stored);
    var host = validateConfig(opts.host);
    var warnings = stored.warnings.map(function (w) { return 'stored ' + w; })
      .concat(host.warnings.map(function (w) { return 'host ' + w; }));
    var cfg = mergeConfig(MODEL_DEFAULTS[opts.businessModel] || {}, stored.config, host.config);
    var accent = cfg.theme.accent;
    var theme = {};
    MODES.forEach(function (mode) {
      var t = accentTheme(accent, mode);
      theme[mode] = { charts: t.charts, reason: t.reason, explain: t.explain, adjusted: t.adjusted };
      if (t.charts === 'maheera' && accent) warnings.push('theme.accent: charts use Maheera’s chart colour in ' + mode + ' mode (' + t.reason + ')');
      if (t.adjusted.length) warnings.push('theme.accent: ' + (mode === 'dark' ? 'lightened' : 'darkened') + ' where needed to stay readable in ' + mode + ' mode (' + t.adjusted.join(', ') + ')');
    });
    return { config: cfg, warnings: warnings, theme: theme };
  }
  // ---------- text and number formatting ----------

  function fill(template, params, labels) {
    return String(template).replace(/\{([a-zA-Z.]+)\}/g, function (m, k) {
      if (params && params[k] != null) return String(params[k]);
      if (labels && has(labels, k) && k.indexOf('.') < 0) return labels[k];
      return m;
    });
  }

  function makeText(cfg, tz) {
    var labels = Object.assign({}, DEFAULT_LABELS, cfg.labels);
    var money0 = new Intl.NumberFormat(cfg.locale, { style: 'currency', currency: cfg.currency, maximumFractionDigits: 0 });
    var money2 = new Intl.NumberFormat(cfg.locale, { style: 'currency', currency: cfg.currency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
    var number = new Intl.NumberFormat(cfg.locale, { maximumFractionDigits: 1 });
    var timeZone = tz || 'Europe/London';
    var time = new Intl.DateTimeFormat(cfg.locale, { hour: '2-digit', minute: '2-digit', timeZone: timeZone });
    var date = new Intl.DateTimeFormat(cfg.locale, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
    var weekday = new Intl.DateTimeFormat(cfg.locale, { weekday: 'long', timeZone: 'UTC' });
    // Plurals: when params.n is 1 and a '<key>.one' label exists, that form is used.
    var t = function (key, params) {
      if (params && Number(params.n) === 1 && has(labels, key + '.one')) key += '.one';
      return fill(has(labels, key) ? labels[key] : key, params, labels);
    };
    var cap = function (s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; };
    var num = function (v) { return v == null || !isFinite(Number(v)) ? '–' : number.format(Number(v)); };
    return {
      t: t,
      cap: cap,
      money: function (v, whole) {
        if (v == null || !isFinite(Number(v))) return '–';
        var n = Number(v);
        return (whole || Math.abs(n) >= 1000 ? money0 : money2).format(n);
      },
      num: num,
      qty: function (v, unit) {
        if (v == null || !isFinite(Number(v))) return '–';
        var n = Number(v);
        if (unit === 'g' && Math.abs(n) >= 1000) return number.format(n / 1000) + ' kg';
        if (unit === 'ml' && Math.abs(n) >= 1000) return number.format(n / 1000) + ' l';
        if (unit === 'each') return number.format(n);
        return number.format(n) + ' ' + (unit || '');
      },
      time: function (iso) { var d = new Date(iso); return isNaN(d) ? '' : time.format(d); },
      // Calendar days (YYYY-MM-DD) relative to the bundle's own day, so the host's clock does not matter.
      day: function (ymd, today) {
        if (!ymd) return '';
        if (today) {
          var diff = Math.round((Date.parse(ymd + 'T00:00:00Z') - Date.parse(today + 'T00:00:00Z')) / 86400000);
          if (diff === 0) return t('today');
          if (diff === 1) return t('tomorrow');
          if (diff === -1) return t('yesterday');
        }
        return date.format(new Date(ymd + 'T12:00:00Z'));
      },
      weekday: function (ymd) { return ymd ? weekday.format(new Date(ymd + 'T12:00:00Z')) : ''; },
      dateTime: function (iso) {
        var d = new Date(iso);
        if (isNaN(d)) return '';
        return new Intl.DateTimeFormat(cfg.locale, { weekday: 'short', hour: '2-digit', minute: '2-digit', timeZone: timeZone }).format(d);
      },
    };
  }

  // ---------- browser-only part: the custom element ----------

  var api = {
    version: VERSION,
    configVersion: CONFIG_VERSION,
    bundleVersion: BUNDLE_VERSION,
    SECTION_IDS: SECTION_IDS.slice(),
    MODELS: MODELS.slice(),
    DEFAULT_LABELS: clone(DEFAULT_LABELS),
    defaultsFor: defaultsFor,
    validateConfig: validateConfig,
    mergeConfig: mergeConfig,
    resolveConfig: resolveConfig,
    contrastRatio: function (a, b) { return MH.contrast(a, b); },
    accentTheme: accentTheme,
    palette: clone(MH.palette),
    density: clone(DENSITY),
    fill: fill,
  };

  if (typeof HTMLElement === 'undefined' || typeof customElements === 'undefined') {
    root.MaheeraPanel = root.MaheeraPanel || api;
    return;
  }

  var SVG_NS = 'http://www.w3.org/2000/svg';

  function h(tag, props) {
    var el = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        var v = props[k];
        if (v == null || v === false) return;
        if (k === 'class') el.className = v;
        else if (k === 'text') el.textContent = v;
        else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
        else if (k === 'style') Object.keys(v).forEach(function (p) { el.style.setProperty(p, v[p]); });
        else el.setAttribute(k, v === true ? '' : String(v));
      });
    }
    append(el, Array.prototype.slice.call(arguments, 2));
    return el;
  }
  function append(el, kids) {
    kids.forEach(function (kid) {
      if (kid == null || kid === false) return;
      if (Array.isArray(kid)) append(el, kid);
      else el.append(kid.nodeType ? kid : String(kid));
    });
  }
  function s(tag, attrs) {
    var el = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { if (attrs[k] != null) el.setAttribute(k, String(attrs[k])); });
    append(el, Array.prototype.slice.call(arguments, 2));
    return el;
  }

  // Every colour, size and font below is a design token (TOKENS_CSS above, from site/shared/tokens.css).
  // Components follow "Component specs" in docs/design-system.md. Padding scales with --mh-density.
  var STYLE = [
    ':host{all:initial;display:block;contain:content}',
    ':host([hidden]){display:none}',
    '*,*::before,*::after{box-sizing:border-box}',
    // Inherited properties (font, colour, spacing, case…) reach a shadow tree through the host element, and
    // a host stylesheet can set them on <maheera-panel> itself. all:initial on the wrapper stops that.
    '.mh{all:initial;display:block;font-family:var(--mh-font);font-size:var(--mh-type-body-size);line-height:var(--mh-type-body-line);',
    'color:var(--mh-text);background:var(--mh-bg);border-radius:var(--mh-radius-lg);overflow:hidden;text-align:left;-webkit-text-size-adjust:100%;',
    'min-width:0;overflow-wrap:anywhere;container-type:inline-size;font-variant-numeric:tabular-nums;',
    '--mh-pad:calc(var(--mh-space-4) * var(--mh-density));--mh-gap:calc(var(--mh-space-3) * var(--mh-density));--mh-cpad:calc(var(--mh-space-4) * var(--mh-density))}',
    '.mh[data-mh-theme=dark]{color-scheme:dark}',
    'button{font:inherit;color:inherit}',
    'svg.i{width:16px;height:16px;flex:none;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}',
    ':focus-visible{outline:var(--mh-size-focus-ring) solid var(--mh-primary);outline-offset:2px}',
    '.sr{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}',
    '.body{padding:var(--mh-pad)}',
    // Chrome: the only place the restaurant's accent fills an area.
    '.head{display:flex;align-items:center;gap:var(--mh-gap);padding:calc(var(--mh-space-3) * var(--mh-density)) var(--mh-pad);background:var(--mh-primary-fill);color:var(--mh-on-primary)}',
    '.head :focus-visible{outline-color:var(--mh-on-primary)}',
    '.brand{display:flex;align-items:center;gap:10px;flex:1;min-width:0}',
    '.logo{display:block;height:32px;max-width:96px;object-fit:contain;flex:none;border-radius:var(--mh-radius-sm);background:#FFFFFF;padding:3px}',
    '.head h2{margin:0;font-size:var(--mh-type-lead-size);line-height:var(--mh-type-lead-line);font-weight:600}',
    // No logo set: the Maheera mark (the lumbung roof) in the same 32 px slot, drawn in the chrome text colour.
    '.logo-mark{display:grid;place-items:center;width:32px;height:32px;flex:none;border-radius:var(--mh-radius-sm);border:1.5px solid currentColor}',
    '.logo-mark svg.mark{width:22px;height:22px;stroke-width:1.6}',
    '.head p{margin:0;font-size:var(--mh-type-caption-size);line-height:var(--mh-type-caption-line);font-weight:500}',
    '.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:var(--mh-size-tap);min-width:var(--mh-size-tap);padding:0 14px;',
    'border-radius:var(--mh-radius-sm);border:1px solid var(--mh-border-strong);background:var(--mh-surface);color:var(--mh-text);cursor:pointer;font-weight:600;font-size:var(--mh-type-small-size)}',
    '.btn:hover{border-color:var(--mh-primary);color:var(--mh-primary)}',
    '.btn.primary{background:var(--mh-primary-fill);color:var(--mh-on-primary);border-color:var(--mh-primary-fill)}',
    '.btn.on-chrome{background:transparent;color:var(--mh-on-primary);border-color:currentColor}',
    '.btn.on-chrome:hover{color:var(--mh-on-primary);border-color:var(--mh-on-primary)}',
    '.btn[aria-pressed=true]{background:var(--mh-primary-subtle);color:var(--mh-primary);border-color:var(--mh-primary)}',
    '.btn.small{min-height:var(--mh-size-control)}',
    '.link{display:inline-flex;align-items:center;gap:6px;min-height:var(--mh-size-tap);padding:0;border:0;background:none;color:var(--mh-primary);font-weight:600;font-size:13.5px;cursor:pointer}',
    '.link:hover{text-decoration:underline}',
    '.tabs{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;padding:0 var(--mh-pad);background:var(--mh-surface);border-bottom:1px solid var(--mh-border)}',
    '.tabs::-webkit-scrollbar{display:none}',
    '.tab{flex:none;display:inline-flex;align-items:center;gap:6px;min-height:var(--mh-size-tap);padding:0 12px;border:0;border-bottom:3px solid transparent;background:none;cursor:pointer;',
    'color:var(--mh-text-2);font-weight:600;font-size:var(--mh-type-small-size);white-space:nowrap}',
    '.tab[aria-selected=true]{color:var(--mh-primary);border-bottom-color:var(--mh-primary)}',
    '.stack{display:grid;gap:var(--mh-gap)}',
    '.card{background:var(--mh-surface);border:1px solid var(--mh-border);border-radius:var(--mh-radius);box-shadow:var(--mh-shadow);padding:var(--mh-cpad);min-width:0}',
    '.card h3{margin:0 0 8px;font-size:15px;line-height:22px;font-weight:600}',
    '.note{margin:-4px 0 8px;color:var(--mh-text-2);font-size:var(--mh-type-small-size);line-height:var(--mh-type-small-line)}',
    // Tones: meaning only, always Maheera's own colours (info is Maheera's indigo), never the restaurant accent.
    '[data-tone=good]{--tone:var(--mh-good);--tone-bg:var(--mh-good-subtle)}',
    '[data-tone=bad]{--tone:var(--mh-bad);--tone-bg:var(--mh-bad-subtle)}',
    '[data-tone=warn]{--tone:var(--mh-warn-text);--tone-bg:var(--mh-warn-subtle)}',
    '[data-tone=info]{--tone:var(--mh-info);--tone-bg:var(--mh-info-subtle)}',
    '[data-tone=neutral]{--tone:var(--mh-text-2);--tone-bg:var(--mh-neutral-subtle)}',
    '.insights{display:grid;gap:12px;list-style:none;margin:0;padding:0}',
    '@container (min-width:768px){.insights{grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}}',
    '.insight{position:relative;display:flex;flex-wrap:wrap;gap:6px 12px;align-items:flex-start;padding:12px 12px 12px 16px;border-radius:var(--mh-radius);',
    'background:var(--mh-surface);border:1px solid var(--mh-border);box-shadow:var(--mh-shadow)}',
    '.insight::before{content:"";position:absolute;left:0;top:12px;bottom:12px;width:3px;border-radius:0 3px 3px 0;background:var(--tone)}',
    '.tile{flex:none;width:var(--mh-size-insight-icon);height:var(--mh-size-insight-icon);border-radius:8px;display:grid;place-items:center;background:var(--tone-bg);color:var(--tone)}',
    '.insight>div{flex:1 1 10em;min-width:0}',
    '.insight strong{display:block;font-size:15px;line-height:22px;font-weight:600}',
    '.insight .text{display:block;margin-top:4px;color:var(--mh-text-2);font-size:13.5px;line-height:20px}',
    '.kpis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--mh-gap)}',
    '.kpi{display:flex;flex-direction:column;gap:8px}',
    '.kpi .top{display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap}',
    '.kpi .label{color:var(--mh-text-2);font-size:13px;font-weight:500}',
    '.kpi .value{font-size:var(--mh-type-kpi-size);line-height:var(--mh-type-kpi-line);font-weight:600;letter-spacing:-.02em;white-space:nowrap}',
    '.kpi .foot{color:var(--mh-text-3);font-size:12.5px;line-height:18px}',
    '.kpi .foot b{color:var(--mh-text-2);font-weight:500}',
    // A chip is one line when it fits; a sentence or a long custom label wraps instead of overflowing, whatever
    // font the device falls back to (the panel loads no web font).
    '.chip{display:inline-flex;align-items:center;gap:4px;min-height:22px;max-width:100%;padding:3px 8px;border-radius:11px;font-size:12px;font-weight:600;line-height:1.25;white-space:normal;',
    'background:var(--tone-bg);color:var(--tone)}',
    '.chip svg.i{width:12px;height:12px;stroke-width:2}',
    '.chart svg.plot{display:block;width:100%;height:var(--mh-size-chart-height)}',
    '.mh[data-density=compact] .chart svg.plot{height:180px}',
    '.chart svg.plot *{vector-effect:non-scaling-stroke}',
    '.xaxis{display:flex;margin-top:6px}.xaxis span{flex:1;text-align:center;color:var(--mh-text-3);font-size:11.5px;line-height:16px}',
    '.chart .bar{fill:var(--mh-chart-accent)}.chart .bar.partial{fill:var(--mh-chart-accent-muted)}',
    '.chart .usual{fill:none;stroke:var(--mh-chart-expected);stroke-width:1.75;stroke-dasharray:5 4}',
    '.chart .grid{stroke:var(--mh-chart-grid);stroke-width:1}',
    '.legend{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:8px;color:var(--mh-text-2);font-size:12.5px}',
    '.legend i{display:inline-block;width:12px;height:12px;margin-right:6px;vertical-align:-1px;border-radius:3px;background:var(--mh-chart-accent)}',
    '.legend i.usual{background:none;height:0;border-top:2px dashed var(--mh-chart-expected);border-radius:0;vertical-align:3px}',
    // Charts: neutral greys plus one colour.
    '.progress{display:flex;height:12px;border-radius:var(--mh-radius-pill);overflow:hidden;background:var(--mh-sunken)}',
    '.progress span{display:block;height:100%}',
    '.p-collected{background:var(--mh-chart-accent)}.p-ready{background:var(--mh-chart-accent-muted)}.p-confirmed{background:var(--mh-chart-expected)}.p-new{background:var(--mh-border-strong)}',
    '.keys{display:flex;flex-wrap:wrap;gap:6px 14px;margin:8px 0 0;padding:0;list-style:none;font-size:12.5px;color:var(--mh-text-2)}',
    '.keys b{color:var(--mh-text);font-weight:600}',
    '.keys i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:6px}',
    '.list{list-style:none;margin:0;padding:0}',
    '.row{display:flex;align-items:center;gap:10px;min-height:56px;padding:12px 0;border-top:1px solid var(--mh-border);min-width:0}',
    '.list>li:first-child>.row,.list>li.row:first-child{border-top:0}',
    '.row .main{flex:1;min-width:0}',
    '.row .name{font-weight:600}',
    '.row .sub{display:block;color:var(--mh-text-2);font-size:13px;line-height:18px}',
    '.row .fig{display:flex;flex-direction:column;align-items:flex-end;gap:4px;text-align:right;font-weight:600;flex:none}',
    '.row .fig small{font-weight:400;font-size:12.5px;color:var(--mh-text-3)}',
    '.row .tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}',
    'button.row{width:100%;border:0;border-top:1px solid var(--mh-border);background:none;text-align:left;cursor:pointer}',
    'button.row .go{color:var(--mh-primary);font-weight:600;font-size:13px;display:inline-flex;align-items:center;gap:4px;flex:none}',
    '.dot{flex:none;width:8px;height:8px;border-radius:50%;background:var(--tone)}',
    '.level{height:6px;border-radius:var(--mh-radius-pill);background:var(--mh-sunken);margin-top:6px;overflow:hidden}',
    '.level span{display:block;height:100%;background:var(--mh-chart-expected)}',
    '.level.low span{background:var(--mh-bad)}',
    '.toolbar{display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin-bottom:8px}',
    '.toolbar h3{margin:0}',
    // Rice-terrace contours: faint, empty states only, never behind numbers.
    '.empty{position:relative;isolation:isolate}',
    '.empty::before{content:"";position:absolute;inset:0;z-index:-1;background:var(--mh-text-3);opacity:.14;pointer-events:none;',
    '-webkit-mask:var(--mh-contours) center/cover no-repeat;mask:var(--mh-contours) center/cover no-repeat}',
    '.empty{display:flex;flex-direction:column;align-items:center;gap:4px;max-width:480px;margin:0 auto;padding:calc(var(--mh-space-6) * var(--mh-density)) var(--mh-space-4);text-align:center}',
    '.empty .tile{width:var(--mh-size-empty-icon);height:var(--mh-size-empty-icon);border-radius:12px;background:var(--mh-sunken);color:var(--mh-text-3);margin-bottom:8px}',
    '.empty .tile svg.i{width:20px;height:20px}',
    '.empty strong{font-size:14px;font-weight:600}',
    '.empty span{color:var(--mh-text-2);font-size:13.5px;line-height:20px}',
    '.error{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start;padding:16px;border-radius:var(--mh-radius);background:var(--mh-bad-subtle);margin:var(--mh-pad)}',
    '.error>svg.i{color:var(--mh-bad);width:18px;height:18px;margin-top:2px}',
    '.error>div{flex:1 1 14em;min-width:0}',
    '.error h3{margin:0;font-size:15px;font-weight:600}',
    '.error p{margin:4px 0 0;color:var(--mh-text-2)}',
    '.error p.next{color:var(--mh-text-3);font-size:13px}',
    '.skel{background:var(--mh-sunken);border-radius:5px;position:relative;overflow:hidden}',
    '.skel::after{content:"";position:absolute;inset:0;transform:translateX(-100%);background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent);animation:mh-shimmer 1.4s infinite}',
    '@keyframes mh-shimmer{to{transform:translateX(100%)}}',
    '.panel-body{animation:mh-in .18s ease-out}',
    '@keyframes mh-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}',
    '@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}',
    // Laid out by the panel's own width, not the viewport: a host may give it a narrow column on a wide screen.
    '.two{display:grid;gap:var(--mh-gap);align-items:start}',
    '@container (max-width:259px){.kpis{grid-template-columns:minmax(0,1fr)}}',
    '@container (max-width:420px){.kpi .value{font-size:22px;line-height:28px}.head .lbl{display:none}}',
    '@container (min-width:760px){.kpis{grid-template-columns:repeat(4,minmax(0,1fr))}}',
    '@container (min-width:760px){.two{grid-template-columns:3fr 2fr}}',
  ].join('\n');

  // Thin, single-stroke icons (16 × 16), drawn in currentColor.
  var ICONS = {
    up: 'M4 12L12 4M6.5 4H12V9.5',
    down: 'M4 4L12 12M12 6.5V12H6.5',
    flat: 'M3.5 8H12.5',
    warn: 'M8 3.5V9M8 12.2V12.4',
    bulb: 'M6.2 13.5H9.8M6.4 11.2C4.6 10.1 4 8.6 4 7.2A4 4 0 0 1 12 7.2C12 8.6 11.4 10.1 9.6 11.2Z',
    check: 'M3.5 8.5L6.5 11.5L12.5 4.5',
    arrow: 'M3 8H12.5M9 4.5L12.5 8L9 11.5',
    refresh: 'M12.8 8A4.8 4.8 0 1 1 11.4 4.6M12.8 2.8V5.6H10',
    star: 'M8 2.5L9.6 6L13.4 6.4L10.6 9L11.4 12.8L8 10.9L4.6 12.8L5.4 9L2.6 6.4L6.4 6Z',
    box: 'M2.5 5.5L8 2.5L13.5 5.5V11L8 14L2.5 11ZM2.5 5.5L8 8.5L13.5 5.5M8 8.5V14',
    clock: 'M8 2.5A5.5 5.5 0 1 1 7.99 2.5M8 5V8.3L10.2 9.6',
  };
  var TONE_ICON = { good: 'up', bad: 'down', warn: 'warn', info: 'bulb', neutral: 'flat' };
  var SEVERITY_TONE = { crit: 'bad', warn: 'warn', good: 'good', info: 'info' };
  var MENU_TONE = { star: ['good', 'star'], plowhorse: ['neutral', 'up'], puzzle: ['warn', 'bulb'], dog: ['bad', 'down'] };

  var SEVERITY_RANK = { crit: 0, warn: 1, good: 2, info: 3 };   // bad, warn, good, info (design spec)

  function icon(name) {
    return s('svg', { class: 'i', viewBox: '0 0 16 16', 'aria-hidden': 'true', focusable: 'false' }, s('path', { d: ICONS[name] }));
  }
  // The Maheera mark: the lumbung roof on its stilts, one line in currentColor. The header's logo when none is set.
  function markIcon() {
    return s('svg', { class: 'i mark', viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' },
      MARK_PATHS.map(function (d) { return s('path', { d: d }); }));
  }
  // StatusTag: status is never colour alone, so every tag has an icon and a word.
  function tag(tone, word, iconName) {
    return h('span', { class: 'chip', 'data-tone': tone }, icon(iconName || TONE_ICON[tone]), word);
  }
  var instances = 0;

  function insightText(x, T) {
    var p = Object.assign({}, x.params || {});
    if (p.weekday_of) p.weekday = T.weekday(p.weekday_of);
    if (p.closes_at) p.when = T.dateTime(p.closes_at);
    var title = x.title || (x.kind ? T.t('insight.' + x.kind, p) : '');
    var body = x.body || (x.kind && has(DEFAULT_LABELS, 'insight.' + x.kind + '.body') ? T.t('insight.' + x.kind + '.body', p) : '');
    return { title: title, body: body };
  }

  function sortInsights(list) {
    return (list || []).slice().sort(function (a, b) {
      return (SEVERITY_RANK[a.severity] == null ? 3 : SEVERITY_RANK[a.severity]) - (SEVERITY_RANK[b.severity] == null ? 3 : SEVERITY_RANK[b.severity]);
    });
  }

  function pctDelta(actual, usual) {
    if (actual == null || usual == null || !(Number(usual) > 0)) return null;
    return Math.round(((Number(actual) - Number(usual)) / Number(usual)) * 100);
  }

  class MaheeraPanelElement extends HTMLElement {
    constructor() {
      super();
      this._id = 'mh' + (++instances);
      this._shadow = this.attachShadow({ mode: 'open' });
      var tokens = document.createElement('style');
      tokens.textContent = TOKENS_CSS;
      var style = document.createElement('style');
      style.textContent = STYLE;
      this._accentStyle = document.createElement('style');
      this._wrap = h('div', { class: 'mh', part: 'panel' });
      this._live = h('div', { class: 'sr', role: 'status', 'aria-live': 'polite' });
      this._shadow.append(tokens, style, this._accentStyle, this._wrap, this._live);
      this._state = 'idle';
      this._bundle = null;
      this._error = null;
      this._hostConfig = null;
      this._section = null;
      this._belowOnly = false;
      this._loadFn = null;
      this._seq = 0;
      this.onError = null;
      this._resolve();
    }

    connectedCallback() {
      if (!this._rendered) this._render();
    }

    get load() { return this._loadFn; }
    set load(fn) {
      this._loadFn = typeof fn === 'function' ? fn : null;
      var self = this;
      // Wait a microtask so `config` assigned straight after `load` still applies to the first render.
      if (this._loadFn) Promise.resolve().then(function () { self.reload(); });
    }

    get config() { return this._hostConfig; }
    set config(c) { this._hostConfig = c || null; this._resolve(); this._render(); }

    get resolvedConfig() { return clone(this._cfg); }
    get warnings() { return this._warnings.slice(); }
    get theme() { return clone(this._theme); }
    get bundle() { return this._bundle; }
    get section() { return this._section; }
    set section(id) { this._select(id, false); }
    get state() { return this._state; }

    // Shows a bundle the host already has (e.g. demo data), without calling load.
    show(bundle) {
      this._seq++;
      this._accept(bundle);
    }

    reload() {
      var self = this;
      if (!this._loadFn) return Promise.resolve();
      var seq = ++this._seq;
      this._state = 'loading';
      this._error = null;
      this._render();
      this._announce(this._T.t('loading'));
      var timer;
      var timeout = new Promise(function (_, reject) {
        timer = setTimeout(function () { var e = new Error('timeout'); e.code = 'timeout'; reject(e); }, LOAD_TIMEOUT_MS);
      });
      return Promise.race([Promise.resolve().then(function () { return self._loadFn(); }), timeout]).then(
        function (bundle) { clearTimeout(timer); if (seq === self._seq) self._accept(bundle); },
        function (err) { clearTimeout(timer); if (seq === self._seq) self._fail(err); }
      );
    }

    destroy() {
      this._seq++;
      this._loadFn = null;
      this.remove();
    }

    _accept(bundle) {
      if (!bundle || bundle.version !== BUNDLE_VERSION) {
        var e = new Error('bundle version');
        e.code = 'bundle_version';
        this._fail(e);
        return;
      }
      this._bundle = bundle;
      this._state = 'ready';
      this._resolve();
      this._render();
      this._announce((bundle.restaurant && bundle.restaurant.name ? bundle.restaurant.name + ': ' : '') + this._T.t('updated', { time: this._T.time(bundle.generated_at) }));
      this.dispatchEvent(new CustomEvent('maheera:ready', { bubbles: true, detail: { warnings: this.warnings } }));
    }

    _fail(err) {
      this._state = 'error';
      this._error = err || new Error('unknown');
      this._render();
      this._announce(this._T.t('error.title'));
      var detail = { code: (err && (err.code || err.status)) || 'error', error: err };
      this.dispatchEvent(new CustomEvent('maheera:error', { bubbles: true, detail: detail }));
      if (typeof this.onError === 'function') {
        try { this.onError(err); } catch (e) { /* the host's handler must not break the panel */ }
      }
    }

    _announce(text) {
      this._live.textContent = '';
      var live = this._live;
      setTimeout(function () { live.textContent = text; }, 30);
    }

    _resolve() {
      var b = this._bundle;
      var model = b && b.restaurant ? b.restaurant.business_model : null;
      var r = resolveConfig({ businessModel: model, stored: b ? b.ui : null, host: this._hostConfig });
      this._cfg = r.config;
      this._warnings = r.warnings;
      this._T = makeText(r.config, b && b.restaurant ? b.restaurant.timezone : null);
      this._theme = r.theme;
      var th = r.config.theme;
      var w = this._wrap;
      // The accent's variables, both modes, validated hex only. Neutral and status tokens are never touched.
      var css = themeCss(th.accent);
      if (this._accentStyle.textContent !== css) this._accentStyle.textContent = css;
      w.style.setProperty('--mh-density', String(DENSITY[th.density] || 1));
      w.style.setProperty('--mh-contours', 'url("' + CONTOURS_URL + '")');
      w.setAttribute('data-mh-theme', th.mode);
      w.setAttribute('data-density', th.density);
      w.setAttribute('lang', r.config.locale);
    }

    // Sections the bundle has data for and the config enables, in configured order.
    _sections() {
      var b = this._bundle;
      if (!b) return [];
      return this._cfg.sections.filter(function (sec) { return sec.enabled && b[sec.id] != null; });
    }

    _select(id, focus) {
      var list = this._sections();
      if (!list.some(function (x) { return x.id === id; })) return;
      this._section = id;
      this._render();
      if (focus) {
        var tab = this._shadow.getElementById(this._id + '-tab-' + id);
        if (tab) tab.focus();
      }
      this.dispatchEvent(new CustomEvent('maheera:section', { bubbles: true, detail: { section: id } }));
    }

    _title(sec) {
      return sec.title || this._T.t('section.' + sec.id);
    }

    _render() {
      this._rendered = true;
      var w = this._wrap;
      w.textContent = '';
      w.removeAttribute('aria-busy');
      if (this._state === 'error') { w.append(this._renderError()); return; }
      if (this._state !== 'ready') {
        w.setAttribute('aria-busy', 'true');
        w.append(h('div', { class: 'body' }, this._renderSkeleton()));
        return;
      }
      var self = this, T = this._T, b = this._bundle;
      var sections = this._sections();
      if (!sections.some(function (x) { return x.id === self._section; })) this._section = sections.length ? sections[0].id : null;

      // Chrome: the restaurant's logo, name and accent. Shown as <img> only; a logo that fails to load is dropped.
      var cfg = this._cfg;
      w.append(h('div', { class: 'head' },
        h('div', { class: 'brand' },
          cfg.logo
            ? h('img', { class: 'logo', src: cfg.logo, alt: '', referrerpolicy: 'no-referrer', decoding: 'async',
              onerror: function () { this.replaceWith(h('span', { class: 'logo-mark' }, markIcon())); } })
            : h('span', { class: 'logo-mark' }, markIcon()),
          h('div', null,
            h('h2', { text: cfg.display_name || (b.restaurant && b.restaurant.name) || 'Maheera' }),
            h('p', { text: 'Maheera · ' + T.t('updated', { time: T.time(b.generated_at) }) }))),
        this._loadFn ? h('button', { class: 'btn small on-chrome', type: 'button', 'aria-label': T.t('refresh'), onclick: function () { self.reload(); } },
          icon('refresh'), h('span', { class: 'lbl', text: T.t('refresh') })) : null));

      if (!sections.length) {
        w.append(h('div', { class: 'body' }, this._empty(T.t('insight.quiet'))));
        return;
      }

      var attentionCount = b.today && b.today.attention ? b.today.attention.length : 0;
      var tabs = h('div', { class: 'tabs', role: 'tablist', 'aria-label': 'Maheera' });
      sections.forEach(function (sec, i) {
        var selected = sec.id === self._section;
        tabs.append(h('button', {
          class: 'tab', type: 'button', role: 'tab', id: self._id + '-tab-' + sec.id,
          'aria-selected': selected ? 'true' : 'false', 'aria-controls': self._id + '-panel', tabindex: selected ? '0' : '-1',
          'data-section': sec.id,
          onclick: function () { self._select(sec.id, true); },
          onkeydown: function (e) {
            var to = null;
            if (e.key === 'ArrowRight') to = sections[(i + 1) % sections.length];
            else if (e.key === 'ArrowLeft') to = sections[(i - 1 + sections.length) % sections.length];
            else if (e.key === 'Home') to = sections[0];
            else if (e.key === 'End') to = sections[sections.length - 1];
            if (to) { e.preventDefault(); self._select(to.id, true); }
          },
        }, self._title(sec), sec.id === 'today' && attentionCount
          ? h('span', { class: 'chip', 'data-tone': 'warn', 'aria-label': attentionCount + ' ' + T.t('attention') }, icon('warn'), String(attentionCount)) : null));
      });
      w.append(tabs);

      var current = sections.filter(function (x) { return x.id === self._section; })[0];
      var panel = h('div', { class: 'panel-body stack', role: 'tabpanel', id: this._id + '-panel', tabindex: '0', 'aria-labelledby': this._id + '-tab-' + current.id },
        this['_render_' + current.id](b[current.id], b));
      w.append(h('div', { class: 'body' }, panel));
      var tab = tabs.querySelector('[aria-selected=true]');
      if (tab && tab.scrollIntoView && tabs.scrollWidth > tabs.clientWidth) tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }

    _renderSkeleton() {
      var bar = function (w, ht) { return h('div', { class: 'skel', style: { width: w, height: ht } }); };
      return h('div', { class: 'stack', 'data-state': 'loading' },
        h('span', { class: 'sr', text: this._T.t('loading') }),
        h('div', { 'aria-hidden': 'true', class: 'stack' },
          h('div', { class: 'stack', style: { width: '60%', gap: '6px' } }, bar('70%', '20px'), bar('45%', '12px')),
          h('div', { style: { display: 'flex', gap: '12px', 'padding-bottom': '10px' } }, bar('64px', '22px'), bar('96px', '22px'), bar('80px', '22px')),
          bar('100%', '56px'),
          h('div', { class: 'kpis' }, [0, 1, 2, 3].map(function () { return h('div', { class: 'card stack', style: { gap: '8px' } }, bar('45%', '12px'), bar('70%', '24px'), bar('55%', '12px')); })),
          h('div', { class: 'card', style: { display: 'flex', 'align-items': 'flex-end', gap: '4%', height: '170px' } },
            [52, 70, 88, 64, 90, 46, 74, 38, 60, 80].map(function (pc) { return h('div', { class: 'skel', style: { flex: '1', height: pc + '%' } }); }))));
    }

    _renderError() {
      var self = this, T = this._T, err = this._error || {};
      var forbidden = err.status === 403 || err.code === 'not_allowed';
      var version = err.code === 'bundle_version';
      return h('div', { class: 'error', role: 'alert', 'data-state': 'error' },
        icon('warn'),
        h('div', null,
          h('h3', { text: T.t('error.title') }),
          h('p', { text: forbidden ? T.t('error.forbidden') : version ? T.t('error.version') : T.t('error.body') }),
          !forbidden && !version ? h('p', { class: 'next', text: T.t('error.next') }) : null),
        !forbidden && this._loadFn ? h('button', { class: 'btn primary', type: 'button', onclick: function () { self.reload(); } }, T.t('error.retry')) : null);
    }

    _empty(text) {
      return h('div', { class: 'empty' }, h('div', { class: 'tile', 'aria-hidden': 'true' }, icon('box')), h('span', { text: text }));
    }

    _goButton(section, label) {
      var self = this;
      if (!this._sections().some(function (x) { return x.id === section; }) || section === this._section) return null;
      var sec = this._sections().filter(function (x) { return x.id === section; })[0];
      return h('button', { class: 'link', type: 'button', onclick: function () { self._select(section, true); } },
        label || this._T.t('insights.go', { section: this._title(sec) }), icon('arrow'));
    }

    _insightList(list, limit) {
      var self = this, T = this._T, b = this._bundle;
      var items = sortInsights(list).slice(0, limit || 50);
      if (!items.length) {
        return h('div', { class: 'insights', role: 'region', 'aria-label': T.t('insights.region') }, h('div', { class: 'insight', 'data-tone': 'good' },
          h('span', { class: 'tile' }, icon('check')), h('div', null, h('strong', { text: T.t('insight.quiet') }))));
      }
      return h('ul', { class: 'insights', role: 'list', 'aria-label': T.t('insights.region') }, items.map(function (x) {
        var tx = insightText(x, T);
        var tone = SEVERITY_TONE[x.severity] || 'info';
        return h('li', { class: 'insight', 'data-tone': tone, 'data-sev': x.severity || 'info' },
          h('span', { class: 'tile' }, icon(TONE_ICON[tone])),
          h('div', null, h('strong', { text: tx.title }), tx.body ? h('span', { class: 'text', text: tx.body }) : null,
            x.section ? self._goButton(x.section) : null));
      }));
    }

    _delta(actual, usual) {
      var T = this._T;
      var pct = pctDelta(actual, usual);
      if (pct == null) return null;
      // DeltaChip: colour from meaning (more sales is good), an arrow and the number, and words for screen readers.
      if (Math.abs(pct) < 2) {
        return h('span', { class: 'chip delta', 'data-tone': 'neutral' }, icon('flat'),
          h('span', { 'aria-hidden': 'true', text: T.t('delta.same') }), h('span', { class: 'sr', text: T.t('delta.sameSr') }));
      }
      var up = pct > 0;
      return h('span', { class: 'chip delta', 'data-tone': up ? 'good' : 'bad' }, icon(up ? 'up' : 'down'),
        h('span', { 'aria-hidden': 'true', text: (up ? '+' : '\u2212') + Math.abs(pct) + '%' }),
        h('span', { class: 'sr', text: T.t(up ? 'delta.above' : 'delta.below', { pct: Math.abs(pct) }) }));
    }

    _kpi(label, value, delta, foot) {
      return h('div', { class: 'card kpi' },
        h('div', { class: 'top' }, h('span', { class: 'label', text: label }), delta),
        h('div', { class: 'value', text: value }),
        foot ? h('div', { class: 'foot', text: foot }) : null);
    }

    _render_today(d, b) {
      var T = this._T, self = this;
      var preorder = b.restaurant && b.restaurant.business_model === 'preorder_kitchen';
      var out = [];
      var actionIds = (d.attention || []).map(function (x) { return x.id; });
      out.push(this._insightList((b.insights || []).filter(function (x) { return actionIds.indexOf(x.id) < 0; }), 2));

      var kpis = h('div', { class: 'kpis' });
      var sales = d.sales || {};
      var y = d.yesterday;
      var yFoot = y && y.usual_gross != null ? T.t('kpi.usualDay', { weekday: T.weekday(y.day), amount: T.money(y.usual_gross, true) }) : null;
      if (preorder) {
        var batch = d.batch;
        kpis.append(
          this._kpi(T.t('kpi.batchOrders'), batch ? T.num(batch.orders) : '–', null, batch && batch.closes_at ? T.t('batch.closes', { when: T.dateTime(batch.closes_at) }) : null),
          this._kpi(T.t('kpi.batchValue'), batch ? T.money(batch.value, true) : '–', null, null),
          this._kpi(T.t('kpi.ready'), batch ? T.num((batch.by_status.ready || 0) + (batch.by_status.collected || 0)) + ' / ' + T.num(batch.orders) : '–', null, null),
          this._kpi(T.t('kpi.yesterday'), y ? T.money(y.gross, true) : '–', y ? this._delta(y.gross, y.usual_gross) : null, yFoot));
      } else {
        var weekday = T.weekday(d.day);
        kpis.append(
          this._kpi(T.t('kpi.salesToday'), T.money(sales.gross, true), this._delta(sales.gross, sales.usual_gross_by_now),
            sales.usual_gross_by_now != null ? T.t('kpi.usualByNow', { weekday: weekday, amount: T.money(sales.usual_gross_by_now, true) }) : T.t('kpi.noUsual')),
          this._kpi(T.t('kpi.orders'), T.num(sales.orders), this._delta(sales.orders, sales.usual_orders_by_now),
            sales.usual_orders_by_now != null ? T.t('kpi.usualByNow', { weekday: weekday, amount: T.num(sales.usual_orders_by_now) }) : null),
          this._kpi(T.t('kpi.avgOrder'), sales.orders ? T.money(sales.gross / sales.orders) : '–', null, null),
          this._kpi(T.t('kpi.yesterday'), y ? T.money(y.gross, true) : '–', y ? this._delta(y.gross, y.usual_gross) : null,
            [yFoot, y && y.margin_pct != null ? T.t('kpi.margin') + ': ' + T.num(y.margin_pct) + '%' : null].filter(Boolean).join(' · ')));
      }
      out.push(kpis);

      var main = preorder ? this._batchCard(d.batch) : this._hourlyCard(d, b);
      var attention = h('div', { class: 'card' }, h('h3', { text: T.t('attention') }));
      var att = d.attention || [];
      if (!att.length) attention.append(this._empty(T.t('attention.none')));
      else {
        attention.append(h('ul', { class: 'list' }, att.map(function (x) {
          var tx = insightText(x, T);
          var tone = SEVERITY_TONE[x.severity] || 'info';
          var canGo = x.section && self._sections().some(function (s2) { return s2.id === x.section; });
          var inner = [h('span', { class: 'dot', 'aria-hidden': 'true' }), h('span', { class: 'main' }, h('span', { class: 'name', text: tx.title }), tx.body ? h('span', { class: 'sub', text: tx.body }) : null)];
          return h('li', { 'data-tone': tone, 'data-sev': x.severity || 'info' }, canGo
            ? h('button', { class: 'row', type: 'button', onclick: function () { self._select(x.section, true); } }, inner, h('span', { class: 'go' }, T.t('attention.open'), icon('arrow')))
            : h('div', { class: 'row' }, inner));
        })));
      }
      out.push(h('div', { class: 'two' }, main, attention));
      return out;
    }

    _hourlyCard(d, b) {
      var T = this._T;
      var hours = d.hourly || [];
      var card = h('div', { class: 'card chart' }, h('h3', { text: T.t('chart.hourly') }));
      if (!hours.length) { card.append(this._empty(T.t('menu.empty'))); return card; }
      var W = 480, H = 200, padL = 4, padB = 2, padT = 8;
      var max = 0;
      hours.forEach(function (x) { max = Math.max(max, Number(x.actual) || 0, Number(x.usual) || 0); });
      max = max > 0 ? max * 1.1 : 1;
      var step = (W - padL * 2) / hours.length;
      var y = function (v) { return padT + (H - padT - padB) * (1 - (Number(v) || 0) / max); };
      // Fixed height (240, 180 compact) at any width: the plot stretches sideways, lines keep their weight,
      // and the hour labels are HTML so they never scale.
      var svg = s('svg', { class: 'plot', viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'none', 'aria-hidden': 'true', focusable: 'false' });
      var axis = h('div', { class: 'xaxis', 'aria-hidden': 'true' });
      [0.5, 1].forEach(function (f) { svg.append(s('line', { class: 'grid', x1: 0, x2: W, y1: y(max / 1.1 * f), y2: y(max / 1.1 * f) })); });
      var now = d.hour;
      var line = [];
      hours.forEach(function (x, i) {
        var x0 = padL + i * step;
        if (x.hour <= now && Number(x.actual) > 0) {
          svg.append(s('rect', { class: x.hour === now ? 'bar partial' : 'bar', x: x0 + step * 0.18, width: step * 0.64, y: y(x.actual), height: Math.max(0, H - padB - y(x.actual)), rx: 3 }));
        }
        if (x.usual != null) line.push((i === 0 ? 'M' : 'L') + x0.toFixed(1) + ' ' + y(x.usual).toFixed(1) + ' H' + (x0 + step).toFixed(1));
        axis.append(h('span', { text: i % 3 === 0 ? String(x.hour).padStart(2, '0') : '' }));
      });
      if (line.length) svg.append(s('path', { class: 'usual', d: line.join(' ') }));
      var weekday = T.weekday(d.day);
      var summary = T.t('chart.hourly') + ': ' + T.t('chart.actual') + ' ' + T.money((d.sales || {}).gross, true) +
        ((d.sales || {}).usual_gross_by_now != null ? ', ' + T.t('chart.usual', { weekday: weekday }) + ' ' + T.money(d.sales.usual_gross_by_now, true) : '');
      var table = h('div', { class: 'sr' }, h('table', null, h('caption', { text: summary }),
        h('tr', null, h('th', { text: 'Hour' }), h('th', { text: T.t('chart.actual') }), h('th', { text: T.t('chart.usual', { weekday: weekday }) })),
        hours.map(function (x) { return h('tr', null, h('td', { text: String(x.hour).padStart(2, '0') + ':00' }), h('td', { text: x.hour <= now ? T.money(x.actual) : '' }), h('td', { text: T.money(x.usual) })); })));
      card.append(h('div', { class: 'legend', 'aria-hidden': 'true' },
          h('span', null, h('i'), T.t('chart.actual')), h('span', null, h('i', { class: 'usual' }), T.t('chart.usual', { weekday: weekday }))),
        h('figure', { style: { margin: '0', position: 'relative' } }, svg, axis, table));
      return card;
    }

    _batchCard(batch) {
      var T = this._T;
      var card = h('div', { class: 'card' }, h('h3', { text: T.t('batch.progress') }));
      if (!batch) { card.append(this._empty(T.t('batch.none'))); return card; }
      var st = batch.by_status || {};
      var total = batch.orders || 0;
      var order = ['collected', 'ready', 'confirmed', 'new'];
      card.append(h('p', { class: 'note', text: (batch.title || batch.ref) + (batch.closes_at ? ' · ' + T.t('batch.closes', { when: T.dateTime(batch.closes_at) }) : '') }));
      var bar = h('div', { class: 'progress', role: 'img', 'aria-label': order.map(function (k) { return T.t('status.' + k) + ' ' + (st[k] || 0); }).join(', ') });
      order.forEach(function (k) { if (total && st[k]) bar.append(h('span', { class: 'p-' + k, style: { width: (100 * st[k] / total) + '%' } })); });
      card.append(bar, h('ul', { class: 'keys', 'aria-hidden': 'true' }, order.map(function (k) {
        return h('li', null, h('i', { class: 'p-' + k }), T.t('status.' + k) + ' ', h('b', { text: T.num(st[k] || 0) }));
      })));
      if (batch.shortfalls) card.append(h('div', { style: { 'margin-top': '10px' } }, tag('bad', T.t('insight.batchShort', { ref: batch.ref, n: batch.shortfalls }))));
      return card;
    }

    _render_forecast(d, b) {
      var T = this._T;
      var weekday = T.weekday(d.day);
      var title = d.source === 'batch' ? T.t('forecast.batchTitle', { ref: d.batch_ref || '' }) : T.t('forecast.title');
      var card = h('div', { class: 'card' }, h('h3', { text: title }), h('p', { class: 'note', text: T.t('forecast.source.' + (d.source || 'baseline'), { weekday: weekday }) }));
      var items = d.items || [];
      if (!items.length) card.append(this._empty(T.t('forecast.empty')));
      else {
        card.append(h('ul', { class: 'list' }, items.map(function (x) {
          var range = x.low != null && x.high != null ? T.num(x.low) + '–' + T.num(x.high) : null;
          return h('li', { class: 'row' },
            h('span', { class: 'main' }, h('span', { class: 'name', text: x.name || x.item_id }), range ? h('span', { class: 'sub', text: range }) : null),
            h('span', { class: 'fig' }, T.num(x.expected), h('small', { text: x.prep != null ? T.t('forecast.prep', { n: T.num(x.prep) }) : T.t('forecast.expected') })));
        })));
      }
      var out = [card];
      if (d.buy && d.buy.length) {
        out.push(h('div', { class: 'card' }, h('h3', { text: T.t('forecast.buy') }), h('ul', { class: 'list' }, d.buy.map(function (x) {
          return h('li', { class: 'row' }, h('span', { class: 'main name', text: x.ingredient }), h('span', { class: 'fig', text: T.qty(x.qty, x.unit) }));
        }))));
      }
      void b;
      return out;
    }

    _render_stock(d) {
      var T = this._T, self = this;
      var reorder = d.reorder || [];
      var rcard = h('div', { class: 'card' }, h('h3', { text: T.t('stock.reorder') }));
      if (!reorder.length) rcard.append(this._empty(T.t('stock.reorderEmpty')));
      else {
        var total = reorder.reduce(function (a, x) { return a + (Number(x.cost) || 0); }, 0);
        rcard.append(h('p', { class: 'note', text: T.t('stock.reorderTotal', { amount: T.money(total) }) }), h('ul', { class: 'list' }, reorder.map(function (x) {
          return h('li', { class: 'row' },
            h('span', { class: 'main' }, h('span', { class: 'name', text: x.name }), h('span', { class: 'sub', text: T.qty(x.on_hand, x.unit) + ' / ' + T.t('stock.par', { par: T.qty(x.par, x.unit) }) })),
            h('span', { class: 'fig' }, x.packs != null ? x.packs + ' × ' + (x.pack_desc || '') : T.qty(x.suggested_qty, x.unit), h('small', { text: x.cost != null ? T.money(x.cost) : '' })));
        })));
      }
      var items = (d.items || []).filter(function (x) { return !self._belowOnly || x.below_par; });
      var all = h('div', { class: 'card' }, h('div', { class: 'toolbar' }, h('h3', { text: T.t('stock.all') }),
        h('button', { class: 'btn small', type: 'button', 'aria-pressed': this._belowOnly ? 'true' : 'false',
          onclick: function () { self._belowOnly = !self._belowOnly; self._render(); var b2 = self._shadow.querySelector('[aria-pressed]'); if (b2) b2.focus(); } }, T.t('stock.belowOnly'))));
      if (!(d.items || []).length) all.append(this._empty(T.t('stock.empty')));
      else if (!items.length) all.append(this._empty(T.t('stock.reorderEmpty')));
      else {
        all.append(h('ul', { class: 'list' }, items.slice(0, 300).map(function (x) {
          var pct = x.par ? Math.max(0, Math.min(100, (Number(x.on_hand) / (Number(x.par) * 2)) * 100)) : null;
          return h('li', { class: 'row' },
            h('span', { class: 'main' }, h('span', { class: 'name', text: x.name }),
              x.par != null ? h('span', { class: 'sub', text: T.t('stock.par', { par: T.qty(x.par, x.unit) }) }) : null,
              x.below_par ? h('span', { class: 'tags' }, tag('bad', T.t('stock.below'))) : null,
              pct != null ? h('div', { class: 'level' + (x.below_par ? ' low' : ''), 'aria-hidden': 'true' }, h('span', { style: { width: pct + '%' } })) : null),
            h('span', { class: 'fig' }, T.qty(x.on_hand, x.unit), h('small', { text: x.value != null ? T.money(x.value) : '' })));
        })));
      }
      return [rcard, all];
    }

    _render_menu(d) {
      var T = this._T;
      var card = h('div', { class: 'card' }, h('h3', { text: T.cap(T.t('menu.title', { days: d.days || 28 })) }), h('p', { class: 'note', text: T.t('menu.legend') }));
      var items = d.items || [];
      if (!items.length) { card.append(this._empty(T.t('menu.empty'))); return card; }
      card.append(h('ul', { class: 'list' }, items.map(function (x) {
        var sub = [T.money(x.price), x.cost_per_item != null ? T.t('menu.cost', { amount: T.money(x.cost_per_item) }) : T.t('menu.noRecipe'),
          x.margin_pct != null ? T.t('menu.margin', { pct: T.num(x.margin_pct) }) : null].filter(Boolean).join(' · ');
        return h('li', { class: 'row' },
          h('span', { class: 'main' }, h('span', { class: 'name', text: x.name || x.item_id }), h('div', { class: 'sub', text: sub })),
          h('span', { class: 'fig' }, x.class ? tag(MENU_TONE[x.class][0], T.t('menu.class.' + x.class), MENU_TONE[x.class][1]) : null, h('small', { text: T.t('menu.sold', { n: T.num(x.qty) }) })));
      })));
      return card;
    }

    _render_purchasing(d, b) {
      var T = this._T;
      var today = b.today && b.today.day;
      var card = h('div', { class: 'card' }, h('h3', { text: T.t('purchasing.title') }));
      var open = d.open || [];
      if (!open.length) card.append(this._empty(T.t('purchasing.empty')));
      else {
        card.append(h('ul', { class: 'list' }, open.map(function (x) {
          var when = x.expected_at ? (x.overdue ? T.t('purchasing.overdue', { when: T.day(x.expected_at, today) }) : T.t('purchasing.due', { when: T.day(x.expected_at, today) })) : '';
          return h('li', { class: 'row' },
            h('span', { class: 'main' }, h('span', { class: 'name', text: x.supplier || '—' }),
              h('span', { class: 'sub', text: when }),
              h('span', { class: 'tags' }, x.overdue ? tag('bad', T.t('purchasing.overdueTag'), 'clock') : x.due ? tag('warn', T.t('purchasing.dueTag'), 'clock') : null,
                tag('neutral', T.t('purchasing.' + x.status), x.status === 'sent' ? 'arrow' : 'flat'))),
            h('span', { class: 'fig', text: T.money(x.value) }));
        })));
      }
      var reorder = b.stock && b.stock.reorder && b.stock.reorder.length;
      return reorder ? [card, h('div', { class: 'card' }, h('div', { class: 'toolbar' }, h('span', { text: T.t('insight.belowPar', { n: reorder }) }), this._goButton('stock')))] : card;
    }

    _render_insights(list) {
      var T = this._T;
      if (!list || !list.length) return h('div', { class: 'card' }, this._empty(T.t('insights.empty')));
      return this._insightList(list, 50);
    }
  }

  if (!customElements.get('maheera-panel')) customElements.define('maheera-panel', MaheeraPanelElement);

  api.mount = function (target, opts) {
    opts = opts || {};
    if (typeof target === 'string') target = document.querySelector(target);
    if (!target) throw new Error('MaheeraPanel.mount: element not found');
    var panel = target.localName === 'maheera-panel' ? target : target.appendChild(document.createElement('maheera-panel'));
    if (opts.config) panel.config = opts.config;
    if (typeof opts.onError === 'function') panel.onError = opts.onError;
    if (opts.section) panel._section = opts.section;
    if (opts.bundle) panel.show(opts.bundle);
    if (typeof opts.load === 'function') panel.load = opts.load;
    return panel;
  };
  api.Element = MaheeraPanelElement;
  root.MaheeraPanel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
