// "Your order is ready" Web Push (Supabase Edge Function "send-push").
//   GET  /send-push/status            -> { configured, publicKey }  (publicKey only when configured)
//   POST /send-push  { order_id }      -> sends one push per order to the customer's subscribed devices
// No new tables: a customer saves their subscriptions in their own doc (customers/{uid}.push, which only they can
// write); the push is claimed by writing bar/{uid}.pushed[order_id], which only staff can write. So the claim is
// also the staff check, and a second "Ready" for the same order sends nothing.
// Secrets (Supabase dashboard > Edge Functions > Secrets): VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto:).
// Without them every send returns 501 not_configured and the app never offers notifications.
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';
import webpush from 'npm:web-push@3.6.7';

const env = (k: string) => (Deno.env.get(k) || '').trim();
const ORIGINS = ['https://rfim.github.io', 'https://app.bijalondon.co.uk', 'https://www.bijalondon.co.uk', 'capacitor://localhost', 'http://localhost', 'http://127.0.0.1:8099'];
const configured = () => ['VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY', 'VAPID_SUBJECT'].every((k) => env(k).length > 0);

function cors(req: Request) {
  const o = req.headers.get('Origin') || '';
  return {
    'Access-Control-Allow-Origin': ORIGINS.includes(o) ? o : ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Vary': 'Origin',
  };
}
const json = (req: Request, status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors(req), 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const clip = (s: unknown, n: number) => String(s ?? '').replace(/[\u0000-\u001f]/g, ' ').slice(0, n);

export function payload(order: { code: string; lines?: Array<{ name?: string }> }) {
  const lines = Array.isArray(order.lines) ? order.lines : [];
  const first = clip(lines[0]?.name || 'order', 40);
  const more = Math.max(lines.length - 1, 0);
  const item = more ? `${first} + ${more} more` : first;
  return {
    title: 'Your order is ready',
    body: `Your ${item} is ready at the bar · Order ${clip(order.code, 8)}`,
    tag: `order-${clip(order.code, 8)}`,
    url: 'app.html?view=app#card',
  };
}

// valid subscriptions saved by the customer (null or malformed entries are skipped)
export function subsOf(doc: any) {
  const map = (doc && typeof doc.push === 'object' && doc.push) || {};
  return Object.entries(map).flatMap(([key, s]: [string, any]) =>
    s && typeof s.endpoint === 'string' && /^https:\/\//.test(s.endpoint) && s.keys && typeof s.keys.p256dh === 'string' && typeof s.keys.auth === 'string'
      ? [{ key, sub: { endpoint: s.endpoint, keys: { p256dh: s.keys.p256dh, auth: s.keys.auth } } }] : []);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors(req) });
  const path = new URL(req.url).pathname.replace(/\/+$/, '');
  if (req.method === 'GET' && path.endsWith('/status')) {
    return json(req, 200, configured() ? { configured: true, publicKey: env('VAPID_PUBLIC_KEY') } : { configured: false });
  }
  if (req.method !== 'POST') return json(req, 405, { reason: 'method' });
  if (!configured()) return json(req, 501, { reason: 'not_configured' });

  const auth = req.headers.get('Authorization') || '';
  if (!/^Bearer\s+\S+/.test(auth)) return json(req, 401, { reason: 'signed_out' });
  const body = await req.json().catch(() => ({}));
  const id = String(body.order_id || '');
  if (!UUID.test(id)) return json(req, 400, { reason: 'bad_order' });

  // every read and write runs as the caller, so the database access rules decide what they can do
  const sb = createClient(env('SUPABASE_URL'), env('SUPABASE_ANON_KEY'), { global: { headers: { Authorization: auth } }, auth: { persistSession: false } });
  const { data: order } = await sb.from('orders').select('id,uid,code,status,lines').eq('id', id).maybeSingle();
  if (!order) return json(req, 404, { reason: 'not_found' });
  if (order.status !== 'ready') return json(req, 409, { reason: 'not_ready' });

  const barPath = `bar/${order.uid}`;
  const { data: bar } = await sb.from('docs').select('data').eq('path', barPath).maybeSingle();
  if (bar?.data?.pushed?.[id]) return json(req, 200, { ok: true, sent: 0, reason: 'already_sent' });
  // claim: only staff can write bar/*, so this is the staff check too
  const stamp = { pushed: { [id]: new Date().toISOString() } };
  const claim = bar
    ? await sb.rpc('doc_update', { p_path: barPath, p_patch: stamp })
    : await sb.from('docs').insert({ path: barPath, data: stamp });
  if (claim.error) return json(req, 403, { reason: 'not_staff' });

  const { data: cust } = await sb.from('docs').select('data').eq('path', `customers/${order.uid}`).maybeSingle();
  const subs = subsOf(cust?.data);
  if (!subs.length) return json(req, 200, { ok: true, sent: 0, reason: 'no_subscriptions' });

  webpush.setVapidDetails(env('VAPID_SUBJECT'), env('VAPID_PUBLIC_KEY'), env('VAPID_PRIVATE_KEY'));
  const msg = JSON.stringify(payload(order));
  let sent = 0; const dead: Record<string, boolean> = {};
  await Promise.all(subs.map(async ({ key, sub }) => {
    try { await webpush.sendNotification(sub, msg, { TTL: 900, urgency: 'high', topic: payload(order).tag.slice(0, 32) }); sent++; }
    catch (e: any) { if (e && (e.statusCode === 404 || e.statusCode === 410)) dead[key] = true; }
  }));
  // tell the customer's app which devices are gone (it can read its own bar doc and tidy up)
  if (Object.keys(dead).length) await sb.rpc('doc_update', { p_path: barPath, p_patch: { pushDead: dead } });
  return json(req, 200, { ok: true, sent, dead: Object.keys(dead).length });
});
