# Reset a forgotten staff PIN

Use this only when nobody knows the current staff PIN. If someone does, change it in the app instead: enter staff mode, open **Menu**, then **Change staff PIN**.

Only the Supabase project owner can do this, because it runs in the Supabase dashboard.

1. Sign in to [supabase.com](https://supabase.com), open the **bija** project, then **SQL Editor**.
2. Paste the query below. Replace `12345678` with the new PIN (6 to 8 digits) and the email with the admin email. Pick a PIN that isn't a birthday or a run.
3. Press **Run**. It should say `1 row affected`.

```sql
-- Sets a new staff PIN and signs out every staff device.
with s as (select encode(extensions.gen_random_bytes(16), 'hex') as salt, encode(extensions.gen_random_bytes(16), 'hex') as esalt)
update public.staff_pin
   set salt = s.salt,
       hash = encode(extensions.digest(s.salt || '12345678', 'sha256'), 'hex'),
       email_salt = s.esalt,
       email_hash = encode(extensions.digest(s.esalt || lower('admin-oversee@bijacoffee.co.uk'), 'sha256'), 'hex'),
       updated_at = now()
  from s
 where id;
delete from public.staff_sessions;
delete from public.pin_attempts;
```

4. Clear the query from the editor so the PIN isn't left on screen. The SQL Editor keeps a history of queries you've run, so delete this one from the history as well.
5. Tell the team the new PIN in person, not by message.

What it does: stores only a salted fingerprint of the new PIN (never the PIN itself), signs every staff device out, and clears any lockout from wrong guesses.

The in-browser demo (GitHub Pages without the backend, or `?demo=1`) uses its own PIN, stored in that browser only. To reset it there, clear the site's data in the browser settings; it goes back to the admin email and PIN in the README.
