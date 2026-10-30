/* Bija website: the web way into the back office. Type "opensesame" anywhere outside a text field and the back office opens
   on its own (app.html?view=bar: admin email + PIN). Leaving it returns to this page. The phone app uses the 3-second hold on Order. */
(function () {
  if (window.Capacitor || window.BijaNative) return;
  var typed = '';
  addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey || !e.key || e.key.length !== 1) return;
    var t = e.target; if (t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName))) return;
    typed = (typed + e.key.toLowerCase()).slice(-10);
    if (typed !== 'opensesame') return;
    typed = ''; e.preventDefault();
    var page = (location.pathname.split('/').pop() || 'index.html');
    location.href = 'app.html?view=bar' + (/^[a-z0-9-]+\.html$/.test(page) ? '&back=' + page : '');
  });
})();
