// catering enquiry: checks the two required fields, then opens an email ready to send; a package button preselects that package
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('enq'), f = form.elements, done = document.getElementById('e-done');
  document.querySelectorAll('[data-pk]').forEach((a) => a.addEventListener('click', () => { f.package.value = a.dataset.pk; }));
  const set = (el, errId, msg) => { const e = document.getElementById(errId); e.textContent = msg; el.toggleAttribute('aria-invalid', !!msg); return !msg; };
  form.addEventListener('submit', (e) => {
    e.preventDefault(); done.textContent = '';
    const name = f.name.value.trim(), em = f.email.value.trim();
    const ok = [set(f.name, 'e-name-err', name ? '' : 'Enter your name.'), set(f.email, 'e-email-err', /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em) ? '' : 'Enter an email address like name@company.co.uk.')];
    const first = [f.name, f.email][ok.indexOf(false)]; if (first) { first.focus(); return; }
    const body = [`Name: ${name}`, `Email: ${em}`, `Company: ${f.company.value.trim() || '(none)'}`, `Event date: ${f.date.value || '(not set)'}`, `Guests: ${f.guests.value || '(not set)'}`, `Package: ${f.package.value}`, `Details: ${f.message.value.trim() || '(none)'}`].join('\n');
    location.href = `mailto:info@bijalondon.co.uk?subject=${encodeURIComponent('Event enquiry: ' + (f.company.value.trim() || name))}&body=${encodeURIComponent(body)}`;
    done.textContent = 'Your email app should now open with your enquiry. Press send there to reach us. If nothing opened, email info@bijalondon.co.uk.';
  });
});

// phones: hide the Plan your event bar while the form is on screen
(() => { const bar = document.querySelector('.cat-bar'), f = document.getElementById('enquire'); if (!bar || !f || !('IntersectionObserver' in window)) return;
  new IntersectionObserver((es) => es.forEach((e) => bar.classList.toggle('away', e.isIntersecting)), { threshold: .15 }).observe(f); })();
