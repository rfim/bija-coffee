// Bija Card wallet passes (Supabase Edge Function "wallet-pass").
//   GET  /wallet-pass/status  -> { apple, google }  which wallets are configured on the server
//   POST /wallet-pass/apple   -> signed .pkpass for the signed-in member (501 until Apple secrets are set)
//   POST /wallet-pass/google  -> { url } Google Wallet save link (501 until Google secrets are set)
// Member data comes only from the ledger RPCs, called as the user, so nobody can mint a pass for someone else.
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';
import { PKPass } from 'npm:passkit-generator@3.6.1';
import { Buffer } from 'node:buffer';
import { applePassJson, googleClaims, signJwtRS256, passAuthToken, APPLE_IMAGES, SITE } from './pass.js';

const env = (k: string) => (Deno.env.get(k) || '').trim();
const ORIGINS = ['https://rfim.github.io', 'https://app.bijalondon.co.uk', 'https://www.bijalondon.co.uk', 'capacitor://localhost', 'http://localhost', 'http://127.0.0.1:8099'];
const APPLE_KEYS = ['APPLE_PASS_TYPE_ID', 'APPLE_TEAM_ID', 'APPLE_SIGNER_CERT_PEM', 'APPLE_SIGNER_KEY_PEM', 'APPLE_WWDR_PEM'];
const GOOGLE_KEYS = ['GOOGLE_ISSUER_ID', 'GOOGLE_SA_JSON'];
const configured = (keys: string[]) => keys.every((k) => env(k).length > 0);

function cors(req: Request) {
  const o = req.headers.get('Origin') || '';
  return {
    'Access-Control-Allow-Origin': ORIGINS.includes(o) ? o : ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Vary': 'Origin',
  };
}
const json = (req: Request, status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { ...cors(req), 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

async function memberFor(req: Request) {
  const auth = req.headers.get('Authorization') || '';
  if (!/^Bearer\s+\S+/.test(auth)) return null;
  const sb = createClient(env('SUPABASE_URL'), env('SUPABASE_ANON_KEY'), { global: { headers: { Authorization: auth } }, auth: { persistSession: false } });
  const { data: me, error: e1 } = await sb.rpc('my_member');
  if (e1 || !me) return null;
  const { data: bal, error: e2 } = await sb.rpc('balances');
  if (e2 || !bal) return null;
  return { uid: me.uid, member_code: me.member_code, points: bal.points, stamps: bal.stamps, tier: bal.tier, free_drink_ready: bal.free_drink_ready };
}

const pem = (v: string) => v.replace(/\\n/g, '\n');

// Pass images live on the public site (wallet/*.png); fetched once per instance and kept in memory.
let images: Record<string, Buffer> | null = null;
async function passImages() {
  if (images) return images;
  const base = env('WALLET_IMAGE_BASE') || SITE + 'wallet/';
  const out: Record<string, Buffer> = {};
  for (const n of APPLE_IMAGES) {
    const r = await fetch(base + n);
    if (!r.ok) throw new Error('image ' + n + ' ' + r.status);
    out[n] = Buffer.from(new Uint8Array(await r.arrayBuffer()));
  }
  return (images = out);
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors(req) });
  const route = new URL(req.url).pathname.replace(/\/+$/, '').split('/').pop();
  try {
    if (route === 'status' && req.method === 'GET') return json(req, 200, { apple: configured(APPLE_KEYS), google: configured(GOOGLE_KEYS) });

    if (route === 'apple' && req.method === 'POST') {
      if (!configured(APPLE_KEYS)) return json(req, 501, { reason: 'not_configured' });
      const member = await memberFor(req);
      if (!member) return json(req, 401, { reason: 'not_signed_in' });
      const base = env('SUPABASE_URL') + '/functions/v1/wallet-pass';
      const authToken = await passAuthToken(member.uid, env('APPLE_SIGNER_KEY_PEM'));
      const passJson = applePassJson(member, { passTypeIdentifier: env('APPLE_PASS_TYPE_ID'), teamIdentifier: env('APPLE_TEAM_ID'), webServiceURL: base, authToken });
      const files: Record<string, Buffer> = { 'pass.json': Buffer.from(JSON.stringify(passJson)) };
      Object.assign(files, await passImages());
      const pass = new PKPass(files, { wwdr: pem(env('APPLE_WWDR_PEM')), signerCert: pem(env('APPLE_SIGNER_CERT_PEM')), signerKey: pem(env('APPLE_SIGNER_KEY_PEM')), signerKeyPassphrase: env('APPLE_SIGNER_KEY_PASSPHRASE') || undefined });
      const buf = pass.getAsBuffer();
      return new Response(buf, { status: 200, headers: { ...cors(req), 'Content-Type': 'application/vnd.apple.pkpass', 'Content-Disposition': 'attachment; filename="bija-card.pkpass"', 'Cache-Control': 'no-store' } });
    }

    if (route === 'google' && req.method === 'POST') {
      if (!configured(GOOGLE_KEYS)) return json(req, 501, { reason: 'not_configured' });
      const member = await memberFor(req);
      if (!member) return json(req, 401, { reason: 'not_signed_in' });
      const sa = JSON.parse(env('GOOGLE_SA_JSON'));
      const claims = googleClaims(member, { issuerId: env('GOOGLE_ISSUER_ID'), clientEmail: sa.client_email, origins: ORIGINS.filter((o) => o.startsWith('https://')) });
      const jwt = await signJwtRS256(claims, sa.private_key);
      return json(req, 200, { url: 'https://pay.google.com/gp/v/save/' + jwt });
    }

    return json(req, 404, { reason: 'not_found' });
  } catch (e) {
    console.error('wallet-pass', e instanceof Error ? e.message : e);
    return json(req, 500, { reason: 'error' });
  }
});
