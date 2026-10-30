// Maheera for Bija's back office (Supabase Edge Function "maheera", deployed with verify_jwt on).
//   POST /maheera  -> { today, stock, reorder, dishes, pnl, brief, missing } read-only, for staff and owners
// Maheera is Kenduri's shared back office (Neon). This function signs in to Neon Auth as Bija's Maheera service user
// and reads a fixed allow-list of views; nothing from the request is forwarded. Maheera's row-level security already
// limits every row to Bija, so there is no restaurant filter here.
// Who may call: staff with a live PIN session, or owners (MFA), checked with the caller's own token:
//   public.maheera_access() (docs/backend/maheera-access.sql: private.is_staff() or private.is_owner()) when applied,
//   otherwise public.staff_touch(), which is ok only inside a live staff session.
// Secrets (Supabase dashboard > Edge Functions > Secrets): MAHEERA_AUTH_URL, MAHEERA_DATA_API_URL, MAHEERA_BIJA_EMAIL,
// MAHEERA_BIJA_PASSWORD, optional MAHEERA_AUTH_ORIGIN. Without them every call returns 503 { error: 'setup' }.
// Logs carry error codes only, never tokens, cookies or rows.

type Env = (k: string) => string;
type Fetch = typeof fetch;

const SECRETS = ['MAHEERA_AUTH_URL', 'MAHEERA_DATA_API_URL', 'MAHEERA_BIJA_EMAIL', 'MAHEERA_BIJA_PASSWORD'];
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const fail = (code: string) => Object.assign(new Error(code), { code });

// London calendar dates (the café's day), as YYYY-MM-DD
export const londonDay = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
export const addDays = (s: string, n: number) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

// The only reads this function makes. Rows come back as Maheera's views define them (see README "Maheera").
export function queries(today: string) {
  const from = addDays(today, -7), to = addDays(today, -1);
  return {
    stock: 'stock_on_hand?select=restaurant_id,name,base_unit,category,par_level,on_hand,below_par&order=below_par.desc,name.asc&limit=300',
    reorder: 'reorder_suggestions?select=restaurant_id,ingredient_id,name,base_unit,on_hand,par_level,suggested_qty,pack_desc,pack_price,suggested_packs&order=name.asc&limit=200',
    dishes: 'dish_performance?select=restaurant_id,item_id,name,category,price,qty,gross,net,cogs,margin_pct,avg_stars,ratings&order=qty.desc.nullslast,name.asc&limit=200',
    pnl: `daily_pnl?select=restaurant_id,day,gross_sales,net_sales,cogs,gross_profit,waste_cost,expenses,operating_profit,lines_without_recipe,sales_without_detail&day=gte.${from}&day=lte.${to}&order=day.desc`,
  };
}

export const jwtExp = (jwt: string) => {
  try {
    const p = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const exp = JSON.parse(atob(p + '='.repeat((4 - (p.length % 4)) % 4))).exp;
    return Number.isFinite(exp) ? exp * 1000 : 0;
  } catch { return 0; }
};

export function createHandler(env: Env, f: Fetch = fetch, now: () => number = Date.now) {
  const trim = (u: string) => u.replace(/\/+$/, '');
  let jwt = '', until = 0, signing: Promise<string> | null = null;

  // Neon Auth: email sign-in gives a session cookie; get-session turns it into a short-lived JWT (set-auth-jwt header)
  async function signIn() {
    const base = trim(env('MAHEERA_AUTH_URL')), origin = env('MAHEERA_AUTH_ORIGIN') || 'https://rfim.github.io';
    const r = await f(base + '/sign-in/email', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin },
      body: JSON.stringify({ email: env('MAHEERA_BIJA_EMAIL'), password: env('MAHEERA_BIJA_PASSWORD') }),
    });
    await r.body?.cancel();
    if (!r.ok) throw fail('auth_sign_in_' + r.status);
    const set = typeof r.headers.getSetCookie === 'function' ? r.headers.getSetCookie() : [r.headers.get('set-cookie') || ''];
    const cookie = set.map((c) => c.split(';')[0].trim()).filter((c) => c.includes('=')).join('; ');
    if (!cookie) throw fail('auth_no_cookie');
    const s = await f(base + '/get-session', { headers: { Cookie: cookie, Origin: origin } });
    await s.body?.cancel();
    const token = s.headers.get('set-auth-jwt') || '';
    if (!s.ok || !token) throw fail('auth_session_' + s.status);
    jwt = token; until = (jwtExp(token) || now() + 5 * 60e3) - 60e3; // refresh 60 s before it expires
    return jwt;
  }
  function token() {
    if (jwt && now() < until) return Promise.resolve(jwt);
    if (!signing) signing = signIn().finally(() => { signing = null; }); // one sign-in shared by concurrent requests
    return signing;
  }
  // Neon Data API (PostgREST); a 401 means the JWT went stale: sign in again and retry once
  async function api(path: string, init: RequestInit = {}, retry = true): Promise<unknown> {
    const t = await token();
    const r = await f(trim(env('MAHEERA_DATA_API_URL')) + '/' + path, { ...init, headers: { ...(init.headers || {}), Authorization: 'Bearer ' + t, Accept: 'application/json' } });
    if (r.status === 401 && retry) { await r.body?.cancel(); if (jwt === t) { jwt = ''; until = 0; } return api(path, init, false); }
    if (!r.ok) { await r.body?.cancel(); throw fail('data_' + r.status); }
    return r.json();
  }

  // the caller's own token decides: Bija staff with an unlocked staff session, or an owner
  async function allowed(auth: string): Promise<number> {
    const base = trim(env('SUPABASE_URL')) + '/rest/v1/rpc/';
    const h = { Authorization: auth, apikey: env('SUPABASE_ANON_KEY'), 'Content-Type': 'application/json' };
    let r = await f(base + 'maheera_access', { method: 'POST', headers: h, body: '{}' });
    if (r.status === 404) { await r.body?.cancel(); r = await f(base + 'staff_touch', { method: 'POST', headers: h, body: '{}' }); }
    if (r.status === 401) { await r.body?.cancel(); return 401; }
    if (!r.ok) { await r.body?.cancel(); return 403; }
    const v = await r.json().catch(() => null);
    return v === true || (v && typeof v === 'object' && (v as { ok?: unknown }).ok === true) ? 200 : 403;
  }

  return async function handle(req: Request): Promise<Response> {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
    if (req.method !== 'POST') return json(405, { error: 'method' });
    const auth = req.headers.get('Authorization') || '';
    if (!/^Bearer\s+\S+/.test(auth)) return json(401, { error: 'signed_out' });
    try {
      const who = await allowed(auth);
      if (who === 401) return json(401, { error: 'signed_out' });
      if (who !== 200) return json(403, { error: 'staff_only' });
    } catch (e) {
      console.error('maheera', 'access_check');
      return json(502, { error: 'access_check' });
    }
    if (!SECRETS.every((k) => env(k).length > 0)) return json(503, { error: 'setup' });

    const today = londonDay(new Date(now())), q = queries(today);
    const keys = Object.keys(q) as Array<keyof typeof q>;
    const got = await Promise.allSettled(keys.map((k) => api(q[k])));
    const out: Record<string, unknown> = { today, missing: [] as string[] };
    const missing = out.missing as string[];
    got.forEach((g, i) => {
      if (g.status === 'fulfilled' && Array.isArray(g.value)) out[keys[i]] = g.value;
      else { out[keys[i]] = null; missing.push(keys[i]); if (g.status === 'rejected') console.error('maheera', (g.reason as { code?: string })?.code || 'error'); }
    });
    // the daily brief needs the restaurant id; take it from any row Maheera returned
    const rows = keys.flatMap((k) => (Array.isArray(out[k]) ? out[k] as Array<{ restaurant_id?: string }> : []));
    const rid = rows.find((r) => typeof r.restaurant_id === 'string')?.restaurant_id;
    out.brief = null;
    if (rid) {
      try {
        out.brief = await api('rpc/daily_brief', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ p_restaurant: rid, p_day: addDays(today, -1) }) });
      } catch (e) { missing.push('brief'); console.error('maheera', (e as { code?: string })?.code || 'error'); }
    }
    if (missing.length >= keys.length) return json(502, { error: 'maheera' });
    return json(200, out);
  };
}

// Deno (Supabase) runs the server; tests import createHandler and pass their own env and fetch
const D = (globalThis as { Deno?: { env: { get(k: string): string | undefined }; serve(h: (r: Request) => Promise<Response>): unknown } }).Deno;
if (D) D.serve(createHandler((k) => (D.env.get(k) || '').trim()));
