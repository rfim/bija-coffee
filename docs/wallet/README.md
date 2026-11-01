# Bija Card in Apple Wallet and Google Wallet

The app can offer "Add to Apple Wallet" on iPhone, "Add to Google Wallet" on Android, and on a computer a QR code that opens the same offer on the phone. **Nothing is shown to customers until the owner completes the steps below.** Until then the server reports both wallets as not configured and the app hides the buttons. Nothing is faked.

## What's built

| Part | Where | What it does |
|---|---|---|
| Edge Function `wallet-pass` | `supabase/functions/wallet-pass/` (deployed to the Supabase project `bija`, London) | `GET /status` says which wallets are configured. `POST /apple` returns a signed `.pkpass` for the signed-in member. `POST /google` returns a Google Wallet save link. Returns `501 not_configured` until the secrets exist. |
| Pass builder | `supabase/functions/wallet-pass/pass.js` | Builds the Apple `pass.json` (storeCard) and the Google loyalty JWT from the member's own data. |
| Browser helper | `wallet.js` | `window.BijaWallet`: `refresh()`, `available()`, `options()`, `add()`, `qrUrl()`, `qrSvg()`, `fromHash()`, `badge()`. |
| Pass artwork | `wallet/` | Icon, logo and Kawung strip at @1x/@2x/@3x (Apple sizes), Google logo 660×660, and `wallet/preview.html` (a mock of the pass). The function fetches these from the public site (`https://rfim.github.io/bija-coffee/wallet/`, or `WALLET_IMAGE_BASE` if set), so they must stay published and the URL must change if the site moves to Bija's own domain. Rebuild them with `scratchpad/wallet/gen-assets.js`. |

Member data on the pass comes only from the ledger functions (`my_member`, `balances`), called as the signed-in customer, so nobody can make a pass for someone else's card.

**On the pass:** member code (as a QR code and text), points, stamps (x of 10), tier, and optionally first name. The St James's Market location makes the pass appear on the lock screen nearby ("Bija is round the corner"). Coordinates 51.5089, −0.1335 are to confirm.

## Owner checklist

### Apple Wallet
1. Join the **Apple Developer Program** as Bija Coffee Limited (organisation account; needs a D-U-N-S number). Annual fee applies.
2. In Certificates, Identifiers & Profiles, create a **Pass Type ID**, for example `pass.uk.co.bijalondon.card`.
3. Create a **Pass Type ID certificate** for it: make a certificate signing request with Keychain Access (or `openssl req -new -newkey rsa:2048 -nodes -keyout signer.key -out signer.csr`), upload it, download the `.cer`.
4. Convert to PEM: `openssl x509 -inform der -in pass.cer -out signer.pem`. Keep `signer.key` private.
5. Download Apple's **WWDR intermediate certificate (G4)** and convert it to PEM the same way.
6. Note your **Team ID** (10 characters, top right of the developer portal).

### Google Wallet
1. Create a **Google Wallet API issuer account** in the Google Pay & Wallet Console as Bija Coffee Limited. Note the **Issuer ID**.
2. In Google Cloud, enable the **Google Wallet API**, create a **service account**, download its JSON key, and add the service account's email as a user in the Wallet console.
3. The pass class (`<issuer>.bija_card`) is created automatically with the first save and starts as "under review". Ask Google to publish it when you're ready to go live.

### Turn it on (Supabase secrets)
Set these on the project `bija` (Dashboard → Edge Functions → Secrets, or the CLI):

```bash
supabase secrets set --project-ref nvsampchuozqbtavuugx \
  APPLE_PASS_TYPE_ID=pass.uk.co.bijalondon.card APPLE_TEAM_ID=XXXXXXXXXX \
  APPLE_SIGNER_CERT_PEM="$(cat signer.pem)" APPLE_SIGNER_KEY_PEM="$(cat signer.key)" APPLE_WWDR_PEM="$(cat wwdr.pem)" \
  GOOGLE_ISSUER_ID=3388000000000000000 GOOGLE_SA_JSON="$(cat service-account.json)"
```

`APPLE_SIGNER_KEY_PASSPHRASE` is optional, for a key with a passphrase. Deploying the function again is only needed after code changes:

```bash
supabase functions deploy wallet-pass --project-ref nvsampchuozqbtavuugx
```

Check: `GET https://nvsampchuozqbtavuugx.supabase.co/functions/v1/wallet-pass/status` with a signed-in user's token should return `{"apple":true,"google":true}`.

### Before launch
- **Swap in the official badges.** `BijaWallet.badge()` draws placeholders in the style of the official buttons; neither logo is reproduced. Download the official "Add to Apple Wallet" badge (Apple Wallet identity guidelines) and the "Add to Google Wallet" button (Google Wallet brand guidelines), put them in `wallet/badges/`, and use them in place of the drawn SVGs. Follow each set of guidelines on size, clear space and placement.
- **Privacy notice.** Once passes go live, `privacy.html` needs a line on wallet passes: what's on the pass, that Apple or Google stores the pass on the customer's device, and how to remove it. The lead session adds this when the secrets are set.
- **Confirm the shop coordinates** in `supabase/functions/wallet-pass/pass.js` (`SHOP`).

## Updating passes (later phase)

Each Apple pass includes `webServiceURL` (this function) and a per-pass `authenticationToken`, so updates can be added without reissuing cards. Points and stamps would then refresh on the lock screen after every collected order. That needs the Apple pass web service endpoints (register, unregister, latest pass) and an APNs push using the same Pass Type ID certificate, triggered from the ledger tables. Google passes update by patching the loyalty object through the Wallet API. Neither is built yet.

## How it was tested

- The real Edge Function ran under Deno against a fake local Supabase API. With no secrets: `/status` returned both false, `/apple` and `/google` returned 501.
- With throwaway test certificates made by openssl (never shipped), it produced a 12-file `.pkpass`. The `manifest.json` SHA-1s matched, the signature verified against the test CA, and `pass.json` held the right fields. The Google save JWT verified with RS256.
- Browser tests: `available()` and `options()` are false and empty when unconfigured and in demo mode, where the server is never called. iPhone offers Apple, Android offers Google, and desktop offers a QR to `app.html?view=app#wallet=apple`. `add()` calls the function with the user's token. No console errors in `app.html`.
- A real pass can only be verified on a device once Bija's Apple and Google accounts exist.
