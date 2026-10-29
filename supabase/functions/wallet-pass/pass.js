// Pure builders for the Bija Card wallet passes. Shared by the Edge Function (Deno) and the local tests (Node).
// No I/O and no secrets here: callers pass in the member data, the identifiers and the signing material.

export const SHOP = { name: 'Bija Coffee', latitude: 51.5089, longitude: -0.1335 }; // 2a St James's Market (coordinates to confirm)
export const SITE = 'https://rfim.github.io/bija-coffee/';

const tidy = (v, n) => String(v ?? '').replace(/[\u0000-\u001f]/g, '').slice(0, n);
const int = (v) => { const n = Math.trunc(Number(v)); return Number.isFinite(n) && n > 0 ? n : 0; };

// member: { uid, member_code, points, stamps, tier, free_drink_ready, name? } (from the balances() and my_member() RPCs)
export function cardFacts(member) {
  const code = tidy(member.member_code, 20).toUpperCase();
  if (!/^BIJA-[A-Z0-9]{3,12}$/.test(code)) throw new Error('member code missing');
  const stamps = Math.min(int(member.stamps), 99);
  return {
    code,
    serial: tidy(member.uid || code, 64),
    points: int(member.points),
    tier: ['Seed', 'Sprout', 'Kopi Tree'].includes(member.tier) ? member.tier : 'Seed',
    stamps,
    stampText: member.free_drink_ready || stamps >= 9 ? 'Next drink free' : `${stamps} of 10`,
    name: tidy(member.name, 30),
  };
}

// Apple Wallet storeCard pass.json. authToken must be >= 16 characters when webServiceURL is set.
export function applePassJson(member, { passTypeIdentifier, teamIdentifier, webServiceURL, authToken }) {
  const f = cardFacts(member);
  const pass = {
    formatVersion: 1,
    passTypeIdentifier,
    teamIdentifier,
    serialNumber: f.serial,
    organizationName: SHOP.name,
    description: 'Bija Card: points, stamps and your member code',
    backgroundColor: 'rgb(11, 11, 11)',
    foregroundColor: 'rgb(255, 255, 255)',
    labelColor: 'rgb(163, 163, 163)',
    sharingProhibited: true,
    storeCard: {
      headerFields: [{ key: 'tier', label: 'TIER', value: f.tier }],
      primaryFields: [{ key: 'points', label: 'POINTS', value: f.points, numberStyle: 'PKNumberStyleDecimal' }],
      secondaryFields: [
        { key: 'stamps', label: 'STAMPS', value: f.stampText },
        { key: 'member', label: 'MEMBER', value: f.code, textAlignment: 'PKTextAlignmentRight' },
      ],
      backFields: [
        { key: 'how', label: 'How it works', value: 'Show this card at the till. 10 points for every £1 in the café, the app and the web shop. 1 stamp per handcrafted drink; the 10th drink is free (up to £5.50).' },
        { key: 'visit', label: 'Find us', value: 'Bija, 2a St James\'s Market, London SW1Y 4AH' },
        { key: 'app', label: 'App', value: SITE + 'app.html?view=app', attributedValue: `<a href="${SITE}app.html?view=app">Open the Bija app</a>` },
        { key: 'privacy', label: 'Privacy', value: 'This card holds your member code, points, stamps and tier. See ' + SITE + 'privacy.html' },
      ],
    },
    barcodes: [{ format: 'PKBarcodeFormatQR', message: f.code, messageEncoding: 'iso-8859-1', altText: f.code }],
    locations: [{ latitude: SHOP.latitude, longitude: SHOP.longitude, relevantText: 'Bija is round the corner' }],
  };
  if (f.name) pass.storeCard.auxiliaryFields = [{ key: 'name', label: 'NAME', value: f.name }];
  if (webServiceURL && authToken && authToken.length >= 16) { pass.webServiceURL = webServiceURL; pass.authenticationToken = authToken; }
  return pass;
}

// The image files every Bija pass carries (names as Apple expects them).
export const APPLE_IMAGES = ['icon.png', 'icon@2x.png', 'icon@3x.png', 'logo.png', 'logo@2x.png', 'logo@3x.png', 'strip.png', 'strip@2x.png', 'strip@3x.png'];

// Google Wallet "save to wallet" JWT claims (unsigned). The class is included so the first save creates it.
export function googleClaims(member, { issuerId, clientEmail, origins, now = Math.floor(Date.now() / 1000) }) {
  const f = cardFacts(member);
  const classId = `${issuerId}.bija_card`;
  const objectId = `${issuerId}.${f.code.replace(/[^A-Za-z0-9._-]/g, '_')}`;
  return {
    iss: clientEmail, aud: 'google', typ: 'savetowallet', iat: now, origins,
    payload: {
      loyaltyClasses: [{
        id: classId, issuerName: SHOP.name, programName: 'Bija Card', reviewStatus: 'UNDER_REVIEW', countryCode: 'GB',
        hexBackgroundColor: '#0b0b0b',
        programLogo: { sourceUri: { uri: SITE + 'wallet/logo-google.png' }, contentDescription: { defaultValue: { language: 'en-GB', value: 'Bija logo' } } },
        heroImage: { sourceUri: { uri: SITE + 'wallet/strip@3x.png' }, contentDescription: { defaultValue: { language: 'en-GB', value: 'Kawung batik pattern' } } },
        locations: [{ latitude: SHOP.latitude, longitude: SHOP.longitude }],
      }],
      loyaltyObjects: [{
        id: objectId, classId, state: 'ACTIVE',
        accountId: f.code, accountName: f.name || 'Bija member',
        loyaltyPoints: { label: 'Points', balance: { int: f.points } },
        secondaryLoyaltyPoints: { label: 'Stamps', balance: { string: f.stampText } },
        barcode: { type: 'QR_CODE', value: f.code, alternateText: f.code },
        textModulesData: [{ id: 'tier', header: 'Tier', body: f.tier }],
      }],
    },
  };
}

const b64url = (bytes) => {
  let s = ''; const a = bytes instanceof Uint8Array ? bytes : new TextEncoder().encode(bytes);
  for (let i = 0; i < a.length; i++) s += String.fromCharCode(a[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

// RS256-sign claims with a service-account PEM private key (WebCrypto: works in Deno and Node 20+).
export async function signJwtRS256(claims, privateKeyPem) {
  const der = Uint8Array.from(atob(privateKeyPem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '')), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const head = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' })) + '.' + b64url(JSON.stringify(claims));
  const sig = new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(head)));
  return head + '.' + b64url(sig);
}

// Per-pass auth token for the (future) Apple pass web service: HMAC of the serial with a server secret.
export async function passAuthToken(serial, secret) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('bija-pass:' + serial)));
  return b64url(mac).slice(0, 32);
}
