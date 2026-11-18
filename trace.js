/* Bean passport (trace.html). Everything shown comes from the QR's URL and the shop catalogue in site-shop.js:
   ?b=<bean id>&r=<roast date YYYY-MM-DD>&l=<lot>&f=<farm or co-op>&h=<harvest>&c=<bag|cup>
   Nothing is sent anywhere. Unknown beans and bad dates are ignored, and all text from the URL is escaped. */
(() => {
  const S = window.BijaShop;
  const root = document.getElementById('passport');
  const esc = S ? S.esc : (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MARK = '<use href="#bija-kw" width="100" height="100"/>';
  const mark = (cls) => `<svg class="${cls}" viewBox="-2 -2 104 104" aria-hidden="true" focusable="false">${MARK}</svg>`;

  // ---------- reading the code ----------
  const BEANS = ['house', 'mandheling', 'lintong', 'java', 'gayo', 'kintamani'];
  const q = new URLSearchParams(location.search);
  const clean = (v, max) => String(v || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max);
  const londonToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const dayNo = (ymd) => { const [y, m, d] = ymd.split('-').map(Number); return Date.UTC(y, m - 1, d) / 864e5; };
  const ukDate = (ymd) => new Date(ymd + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/London' });
  const addDays = (ymd, n) => new Date((dayNo(ymd) + n) * 864e5 + 432e5).toISOString().slice(0, 10);
  function roastDate(v) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v || '')) return null;
    const [y, m, d] = v.split('-').map(Number), t = new Date(Date.UTC(y, m - 1, d));
    if (t.getUTCFullYear() !== y || t.getUTCMonth() !== m - 1 || t.getUTCDate() !== d) return null; // 2026-02-31 and friends
    const age = dayNo(londonToday()) - dayNo(v);
    return age < 0 || age > 730 ? null : v; // not in the future, not older than two years
  }
  const code = {
    b: BEANS.includes(q.get('b')) ? q.get('b') : null,
    r: roastDate(q.get('r')),
    l: clean(q.get('l'), 24),
    f: clean(q.get('f'), 60),
    h: clean(q.get('h'), 30),
    c: q.get('c') === 'cup' ? 'cup' : 'bag',
  };

  // ---------- map of Indonesia (simplified outlines, longitude/latitude → SVG) ----------
  // equirectangular, 21 units per degree. Coastlines: Natural Earth 1:50m (public domain), the same paths as the origins map
  // in site-discover.js (10 units per degree, scaled by 2.1 here). Rebuild with scratchpad map2/build-ne.js.
  const X = (lon) => ((lon - 94.5) * 21).toFixed(1), Y = (lat) => ((7.2 - lat) * 21).toFixed(1);
  const ISLANDS = {"ctx_0":"M305.7 167.1L304.6 164.1L306 163.9L306.5 162.4L306 162L304.4 162.5L304.2 161.4L306.8 158.5L313.1 156.9L321.2 156.6L324.7 155.2L328 156.2L324.1 159.2L321.7 159.8L319.9 161.1L316.7 162L314.5 163.2L309.1 164.8Z","ctx_1":"M295.4 165.4L299.4 163.9L299.1 165.1L297.8 166.3L295.9 166.2Z","ctx_2":"M464.8 163.2L464.8 141.1L463.6 139.4L464.8 135.5L465 98.1L466.8 98.3L473 101.1L473 164.1L469 163.5L466.3 164.2Z","ctx_3":"M56.2 7.6L56.8 5.3L57.6 5.2L58.5 6.5L61.3 7.5L62.6 7.4L63.7 9.5L65.5 9.6L65.8 12.4L64.8 14.3L66.1 15.6L66.9 15.3L67.6 14.1L70.6 12.9L71.8 14.2L72.9 14.2L73.7 13.8L76 9.6L77.8 10L80.3 13.4L86 17.9L89.2 23.5L89.5 25.3L89.7 28.1L88.6 34.3L89.5 36.8L89.4 42.7L90.4 44.3L93.1 46.2L97.2 54.8L97.9 57.2L97.5 58.1L96.8 58.3L96.1 57.9L94.8 55.8L94.9 57.4L91.9 57.5L89.8 58.7L88.6 56.5L82.3 53.4L80.5 51.6L76.5 49.5L72.8 46.3L70.2 45.2L68 43.1L68.5 41.9L68 39.5L62.2 32.3L63 31.8L61.2 28.3L61.2 25.5L58.5 16.1L58.4 12.2Z","ctx_4":"M230.8 30.3L226 28.6L220.1 28.3L219.2 28.9L217.4 28.4L215.2 29.1L213.4 28.7L211.8 30.1L210.7 32.6L210.7 37.5L209.5 41.6L208.1 42.1L207.5 41.7L206.2 43.1L205.8 45.7L206.8 46.8L202.9 49.5L202.6 50.4L203.3 52.2L203 53.1L202 53.5L201.3 55.8L200.1 57.5L198.9 57L194 57.7L191.2 59.6L185.1 57.7L184.4 56.3L179.8 56.4L176.9 57.6L175.8 60.6L174.2 60.9L173.1 61.9L166 61.5L160 63.4L152.3 56.8L151.6 55.8L151.4 54.2L150.5 53.5L151.3 51.7L152.2 53.4L153.6 54.4L156.1 55L158.5 54.8L161.7 56.5L163.9 56.7L166 58L167.2 58L165.6 57.1L165.3 56.4L166.5 54.6L167.5 51.4L167 49L167.4 47.6L168.5 48.3L169.4 48.2L169.4 45.7L171.2 43.8L184.9 40.4L194.2 29.6L195.1 26.3L196.7 26.7L198.2 29.4L199.2 29.4L200.7 31.5L201.6 31.6L202.7 30.3L203.4 28.1L202.5 24.8L205.3 23L206.1 28.1L208.2 28.4L207.7 25.7L206.4 23L208.8 22.7L210.6 21.1L210.8 20.1L209.7 19.5L209.2 17.9L211 16L211.2 16.5L212.4 16.7L213.8 15.9L215.6 13.2L216.4 10.7L220 6.8L222.8 2.1L223.3 2.5L223.5 3.7L222.9 5.9L224.1 5.4L226.3 2.3L227.5 2.8L227.9 5.2L231.5 7.3L231.9 9.3L231.1 10L231.4 12L230 13.2L233.2 12.6L235 11.5L236.2 13.4L234.4 14.1L234.7 14.9L237.5 13.8L238.5 13.9L240.1 14.7L240.9 16.1L244.6 17.7L246.8 17.7L247.6 18.3L247.5 20L246.3 21L241.7 22.4L238.8 21.8L237.6 22.1L236.8 23.7L240.6 27L240.9 27.4L240.5 28.2L235.1 29.5L232 28.6Z","ctx_5":"M57.9 19L56.9 19.2L57.4 17.3L58.4 17.9Z","ctx_6":"M53.5 7.3L54.2 8.4L52.4 9.4L51.5 7.8Z","ctx_7":"M168.9 47.8L168.1 47.6L168.3 44.3L168.8 44.9Z","ctx_8":"M233.8 30.1L231.5 30.3L232.1 29.4Z","id_9":"M29.8 57.3L34.3 62.3L33.8 65.7L33.2 66.4L31.9 66L31 63.7L29 62.5L28 60.1L25.8 57.7L27.5 57.8L28.6 56.6Z","id_10":"M46.6 89.8L45.7 89.8L43.3 88.1L41 84L41.8 81.7L43.7 81.2L44.3 81.5L46.3 86.4L47.7 88.3L47.7 89.4Z","id_11":"M221.4 158.1L220.1 160.2L220.9 160.9L217.4 161.1L213.6 159.9L213.7 159.4L215.8 159.5L215.6 156.4L219 154L222.2 155.4Z","bali":"M209.5 153.6L212 156.1L208.3 158.2L207.2 160.2L206.5 160.5L205.9 160.3L206.4 159L205.6 157.7L203.4 156.3L201.1 155.8L199.7 153.7L200 153.2L204.4 153.9L206.5 152.7Z","id_12":"M115.4 88.7L116.6 90.7L117.1 93.9L118.6 96.6L123.2 97.7L122.1 98.6L121.1 101L121.7 102.7L115 100.3L114.1 98.4L114.4 96.9L113.1 95.1L112.9 93.8L110.5 92.8L108.4 93.2L106.3 92.4L106.9 91.2L108.7 90.1L108.7 88.6L109.6 87.7L110.8 87.3L112 89.3L112.5 88.6L112.2 87.3L114.1 87Z","id_13":"M286.8 117.5L287 120.2L286.2 119.2L285.5 119.5L284.7 123.4L284.8 123.9L285.5 123.6L286.5 124.2L286.9 125.3L285.4 126.2L284.7 126.1L283.1 128.7L281.4 128.6L280.9 126.9L282.7 124.1L283.5 118.2L284.5 116.4L285.8 115.9Z","id_14":"M281.4 124.7L280.7 125.9L278.9 125.4L278.1 125.8L277.8 125.2L279 122.7L278.3 120.5L278.7 119.7L282 118.2L282.6 121.3L281.2 123.4Z","id_15":"M138.2 35.1L136.8 35.5L136 34.9L137.4 33.9L135.9 33.5L135 32.2L135 31.6L137.5 29.8L138.9 32.1L139 33.6Z","id_16":"M137.1 102L136.7 103.4L135.6 104.3L134.8 104.2L133.6 102.9L133.2 103.6L131.1 104.1L131.4 103.2L130.6 101.2L131.7 97.7L133.4 97.3L135.7 98L137.2 99L137.9 100.3Z","id_17":"M408.8 78.5L413.9 79.3L416.6 81.8L418.7 82.9L416.7 84.1L414.1 83.8L413.4 83.2L412.5 80.2L411.4 80.8L409.3 79.7Z","id_18":"M409.7 87.9L417 88.6L423.9 90L417.3 90.9L409.9 88.7Z","id_19":"M363.1 72L367.8 73.5L368.4 74.9L367.6 75.7L364.5 75.4L361.8 72.8L361.2 72.9L361.4 73.4L362.6 74.9L364 75.4L364 76.2L362.5 76.4L361.9 75L360.5 75.7L360 74.7L357.4 74.1L358.6 72.7L359.3 73Z","id_20":"M339.5 51.5L338 51.6L337.2 49L338.3 47.3L341 46L341.9 47.3L341.2 49.8L340.5 51Z","id_21":"M336.5 88.6L335.6 89.1L330.6 89.3L328.9 88.5L329.6 86.5L331.5 85.3L334 86.4L336.5 88Z","id_22":"M315.5 96.5L314.8 96.2L313.6 92.8L314.2 91.7L314.9 92.1L314.7 93.7Z","id_23":"M315.2 89.9L318.3 90.2L314.6 91.2L309.3 91.4L308.9 90.4Z","id_24":"M304.7 89.1L306.9 89.1L307 89.8L308.2 90.1L308.2 90.8L305.1 91.4L303.3 91L299.2 92L298.3 90.6L299.2 88.6L301.6 88.4Z","id_25":"M368.2 152L366.2 152L365.9 150.7L366.4 148.8L366.9 148.7L367.6 146.7L370.4 144.2L370.3 143.7L371.4 143.1L372.4 144L371.4 144.7L371.9 146.4L371.2 148.3L368.8 150.7Z","id_26":"M323 148.7L323.1 149.4L320.8 150.1L319.7 151.5L315.4 150.9L313 151.8L313.1 150.8L314.7 148.6L317.2 149.1L321.1 147.7Z","id_27":"M300.7 153.4L301 154L305.5 153.8L306.2 154.1L306.3 155.3L299.4 156.5L298.5 155.9L299.3 155L298.9 154.5L299.3 153.8Z","id_28":"M365 85.2L363.5 85.2L362.8 84.6L361.7 81.6L364 80.9L365.3 81.2L365.8 81.7Z","sumatra":"M19.9 19.7L23.4 19.3L30.5 19.9L34.1 23.2L35 25.4L37.5 27.8L37.4 30.1L38.1 31.1L41.6 32.7L42.8 34.4L46.5 36.2L52.3 40.2L60.3 50.1L63.9 52.5L63.3 49.6L64.4 49.1L65.5 49.4L68 51.9L69.8 55.1L72.9 55.8L76 58.4L77.4 62.1L78.9 63.6L80.7 64.5L84.5 65.4L85.7 67.1L85.1 67.8L80.5 69.8L83.9 69.2L88.4 66.9L89.8 67.2L91.7 69.1L92.9 71.5L89.3 73.9L89.1 75.6L90.1 76.7L89.4 77.8L90.3 79.5L92.2 80.9L95.6 82.2L98.8 82.7L100.1 90.2L100.7 91.2L103.5 92.9L103.3 94.3L101.5 96.3L101.5 97.9L104.7 95.7L109 95.8L110.8 96.9L115.4 103.1L115.6 104.2L114 106.1L113.4 108.1L113.5 109.3L114.3 110.3L113.3 113.6L113.9 122.1L113.2 128.8L112.5 130.2L111.2 130L108.5 127.5L105.8 129.5L101.4 127.2L101.2 128.4L101.8 130.9L101 131.1L95.7 125.9L93.3 122.8L84.2 116.7L80.4 113.5L76.3 108L70.8 103.7L68.1 99.3L66.2 97.9L63.9 94.5L63.6 91.4L59.9 85L58.1 80.3L53.6 75.1L51.7 71.5L46.6 68.5L43 57L41 53.3L35.8 50.1L32 48.4L30.9 43.5L28.9 42.2L24.7 36.2L23 34.9L19.4 33.8L9.3 23.4L7.1 19.2L7.3 16.4L7.8 16.1L9 15.7L12.4 16.2L16.3 19.1Z","id_29":"M282.8 158.1L279.7 159.3L275.9 159.5L271.5 161L270.9 160.2L269.1 160.1L268.3 161.2L265.4 161.3L260.5 160L256.2 159.8L254.1 160.6L253.1 159L253.8 156.2L254.6 156.4L258.5 154.6L261.1 154.4L269.5 157.8L274.7 156.6L278.2 158.3L279.3 158L280.5 156.3L283.5 155L284.2 154.2L282.6 153.9L283.5 152.9L284.8 153.5L285 155.3L283.1 156.8L283.5 157.6Z","id_30":"M255.1 165.8L257.2 167.1L257.9 168.5L259.4 168.5L260.6 169.2L262.8 171.6L263.3 172.4L263 173.1L262 174.1L259.4 174.9L256.5 174L254.3 171.7L251 169.7L248.6 169.7L245.4 168.7L244.6 167.2L246.8 165.8L253 165.8L254.4 165Z","id_31":"M237.4 155.2L238.4 155.5L239.9 154.7L241.1 154.8L242.1 156.2L242.5 155.3L244.3 155L246.3 158.7L245.8 159.3L243.2 159.1L242.5 159.3L243.3 160.3L239.3 160.5L238.8 158.7L236.9 160.4L230.1 162.1L225.6 163L222.9 162.1L222.8 158.7L223.3 157.3L226.6 155.7L230.7 156.3L233.1 159.1L234.7 159.3L237.1 158.5L237.3 157.9L233.2 155.4L232.6 153.5L234.2 152.9L236.2 153.2Z","id_32":"M303.9 62L299.3 67.3L297.2 68.2L292.5 68.9L287.7 68.7L285.8 67.2L285 67.1L273.4 67.6L270.2 67L265.1 67.6L260.8 66.7L258.5 67.5L256.9 69.3L255.1 74L255.6 77.5L257.4 80.7L260.2 82.4L261.7 85.7L265.4 86.1L266.5 85.4L267.8 83.2L270.8 80.3L272.4 81.3L274.7 81.3L277.8 79.6L283.9 79.5L283.3 78.6L286.7 77.7L288.8 78.5L289.3 79.8L288.8 82L287.3 82L285.5 80.7L284 81L280.1 85.5L277.5 87.5L273.6 88.9L271.5 91L269 90.3L268.6 90.8L268.5 91.5L270.8 93.5L272.7 94.4L275.8 99.5L277.9 101.1L278.1 102.5L279 104L278.2 104.8L277.5 108.2L280.8 110.8L281.9 112.8L283.5 112.7L284 114.3L283.7 115.9L282.2 115.4L282.2 116.1L279.7 116.2L276.2 117.4L275.5 118.2L275.4 120.3L270.9 119.6L269.9 117.8L271.2 112.9L268.1 111.2L263.9 107.2L264.1 106L265.5 103.7L265.5 99.5L264.9 98.7L263.8 98.5L261.5 98.7L257.6 101.5L257.5 102.5L258.9 105.5L259.4 109.1L258.6 112.9L259.2 118.2L257.8 123.5L259.3 127.9L258.1 127.4L254.5 127.8L252.2 128.9L250.6 128.1L248.8 126.2L248.6 125.2L250.9 117.2L251.2 112.3L249.8 109.3L249.7 107.1L248.6 106.6L244.9 107.4L244.2 106.8L243.3 104.8L243.6 101.3L242.8 99.2L245.9 96.8L246.7 93.4L248.2 91.3L248.1 86.1L250.1 81.1L252.1 78.8L253.4 80.6L252.2 72.9L253.4 72.2L253.1 69.6L257.7 62.3L258.2 62.2L259.2 63.5L261 63.5L263.7 59.5L265.8 58.7L269.1 59.6L270.9 61.3L273.7 61.1L279.4 61.8L283.4 63.5L285.7 62.6L293.5 63.6L297.8 61.8L299.1 60.2L300.3 59.7L301 58.1L302.9 57.3L304.9 55L306.6 55.6L307.3 57Z","java":"M128.7 132.1L129.7 133.2L131.7 134.2L138.3 134.9L140.2 136.7L141 139.3L141.8 139.9L148 140.7L150 140.1L153.2 141L157 140.9L159.3 141.5L160.8 140.1L162 137.2L163.4 136.2L164.7 136.4L166.8 138.9L170.4 138.5L172.4 139.7L174.9 140.1L175.9 140.9L180.4 141.3L181.5 144.2L182.9 145L182.9 147.5L185.1 148.6L190 149.2L195.7 148.3L199.1 149.9L199.4 152L198.9 156.1L199.8 158L200.9 158.8L200.8 159.7L197.8 158.2L194.4 157.7L187.5 154.9L181.8 156.1L170.1 155L161.1 153.5L153.5 150.3L147.8 149.1L142.4 148.7L139.5 150L137.2 149.8L133 148.9L127.9 146.7L119.5 145.7L119.2 144.4L120.2 142.5L114.4 140.6L107.6 140.4L107.7 139.3L108.7 138.6L108.9 139.5L109.8 139.8L111.6 136.7L112.9 136.6L113.7 133.2L115.7 131.1L123.3 133L125.1 132.1L125.5 131Z","id_33":"M151.3 51.7L150.4 53L151.4 54.2L151.6 55.8L160 63.4L166 61.5L173.1 61.9L174.2 60.9L175.8 60.6L176.9 57.6L179.8 56.4L184.4 56.3L185.1 57.7L191.2 59.6L194 57.7L198.9 57L200.1 57.5L201.3 55.8L202 53.5L203 53.1L203.3 52.2L202.6 50.4L202.9 49.5L206.8 46.8L205.8 45.7L206.2 43.1L207.5 41.7L208.1 42.1L209.5 41.6L210.7 37.5L210.7 32.6L211.8 30.1L213.6 28.5L215.2 29.1L217.4 28.4L219.2 28.9L220.1 28.3L226 28.6L230.8 30.3L229.6 31.2L232.8 35.1L231.3 35.6L230.1 34.7L229.5 35.7L225.6 35.8L226.6 36.1L228.4 37.7L228.8 38.3L228.2 39.6L228.5 40.1L231.1 41.4L231.4 42.5L230.7 42.7L232 43.1L231.4 43.7L232.8 44.5L235.6 48.8L235.4 49.8L232.9 51.7L235.8 55L241.4 58.8L244.9 62.2L243.9 63.1L240.3 63.9L236.9 63.3L234.1 61L234.6 63.1L232.4 64.7L230.2 69.6L229.6 75.2L230.5 77.5L230.6 79.7L227.4 81.3L224.1 84.2L223 83.8L222.4 82.4L222.5 85.3L217.8 89.9L219.2 89.9L219.5 91.2L219.2 92.5L218.2 93.4L220.3 94.1L220.6 95L220.3 97.1L218.2 97.5L218.1 98L218.8 97.8L218.3 101L217.3 101.8L216.7 101.3L216.7 102.3L217.6 103.3L215.6 105.5L214.6 107.9L202 113.7L201.3 113.1L200.3 105.8L199.5 106.8L198.4 106.4L198 106.1L198.4 104.4L197.3 105.6L195.8 104.8L194.6 105.9L192.1 106.6L191.3 106.2L191.1 104L188.4 104.5L185.4 101.3L184.7 103.9L182.6 105.2L181 106L177.8 105.2L173.6 107.5L173.2 102.6L172 100.9L171.2 101.7L168.7 101.3L164.3 102.7L163.3 102L164 101.1L162 102.2L160.7 100.9L157.6 101.7L156 92L154.6 90.6L155.4 87.3L154.8 84.8L152.9 82.1L149.5 80.7L148.3 80.8L147.6 80.1L148.7 78.4L146.6 76.9L146.2 75.9L146.9 72.1L147.6 71.7L144.5 68.4L144.2 62.9L144.6 60.7L146.3 59.5L145.1 59.6L145.8 57L147.7 54.9L148.8 52.8Z","id_34":"M332.3 63.5L333.8 63.7L334.7 61.6L336.6 60.4L336.6 58.8L337.2 58L340.4 56.4L341.9 56.3L342.1 56.7L342 60.9L338 63.2L337.6 64.7L341.1 66.5L341.9 68.4L344 69.8L339.5 68.1L334.8 67.3L333.9 69L333.9 71.5L334.8 74.5L337.5 79.3L339.3 80.9L337.8 80.7L337.4 79.9L335.5 79.1L333.9 76.2L331.9 74.4L332.1 69.1L330.5 67.1L330.4 65.9L331.1 63.5L330.2 62.8L329.3 60.6L329.2 59.5L330.4 57.3L331.3 53.6L334 50.6L335.4 50L333.9 53.7L335.1 55L335.1 58.7L333.9 60.4L331.5 61.9L331.3 62.6Z","id_35":"M352.5 100.7L354.8 101.8L358.8 101.9L360.7 103.3L361.7 105.9L362.7 106.2L363.6 107.7L363.1 110.6L355.2 106.7L353.4 105.3L350.1 105.3L350.2 106.3L349.7 106.5L344.7 105.3L344.6 104.4L343.6 104.4L341.4 106.3L340.2 106.5L336.3 103.6L334 107L334.3 105.4L333.8 104.2L337 100.7L344.9 100.3L346.7 101.3L349.8 99.9Z","id_36":"M323.6 102.9L325.3 103.7L327.5 106.7L327.3 108.3L324.4 109.6L321.9 110.2L320.5 109.7L317.2 108.1L315.6 106.2L315.3 103.7L315.9 103.1L317.2 103.5L320.5 102.7Z","id_37":"M304.2 161.4L304.4 162.5L306 162L306.5 162.4L306 163.9L304.6 164.1L305.7 167.1L304.6 168.7L299.3 173.5L296.7 173.8L293.6 175.4L291.5 175.1L291.1 174.2L292.2 172.8L290.9 171.7L292.1 168.2L295.4 165.4L295.9 166.2L298.2 166.1L299.4 163.9Z","id_38":"M402.5 129.1L402.2 135L401.4 135.7L399.4 135.3L396.5 132.6L396.5 132.2L398 132.1L398.4 130.3L397 129.1L398.4 129.1L400.1 126.4L400.7 126.3Z","id_39":"M400.4 136.4L400 137.9L398.2 140.5L397 141.1L395.9 140.3L396.1 136.7L396.9 136.6L396.2 136.3L396.1 133.9L396.7 133.8Z","id_40":"M440.3 154.7L438 156.1L431.5 155.9L433.3 151.3L435.8 147.7L438 146.4L442.7 145.9L444.6 147.9L444.9 149L442.9 152.6Z","id_41":"M464.7 98.1L464.8 135.5L463.6 139.4L464.8 141.1L464.8 163.2L454.8 153.7L456.2 151.2L454.4 153L448.8 153.9L447.8 153.1L447.5 151.8L446.9 152.9L444.3 154.6L443.9 154.4L443.6 153.4L445.9 147.9L442.5 144.5L446.8 143.9L443.4 143.4L441 141.4L443.7 140.6L439.4 135.4L438 131.5L438.8 130.4L437 130.1L438.4 128.8L435.9 129.1L435.6 126.7L428.1 122.1L427.8 121.5L427 121.9L421.2 120.2L414.8 117.3L406.9 116.5L402.5 114L401.8 112.8L402.1 111.5L403.9 111.4L400.5 111.8L398.9 111.1L397.7 111.5L396.5 110L394.7 110.2L391.8 106.8L392 104.5L393.4 102.5L392 102.9L391.5 105.6L390.2 106.1L390.4 107.2L389.2 109.3L389 111L387.5 112.6L384.7 112.9L384.2 112.6L382.5 109L383.7 107.5L382.5 104.9L378.5 101.7L375.5 101.1L374.7 99.9L377.3 98.8L382.2 99.9L385.3 96.9L386.9 96.4L391.1 97.5L392 98.2L392.5 96.5L394.1 95.9L394 95L392.9 94.9L394.2 93L392.1 93.9L384.6 94.7L378.1 94.4L375.2 91.9L374.3 87.6L368 85.9L365.6 86.5L365 85.8L366.9 83.7L367.6 80.6L373 79L376.3 76.5L378.9 75.6L383.6 76.2L389.7 79.3L394.7 79.4L396.1 80.5L395.7 82L397.6 85.6L396.1 89.2L396.9 95.1L399.6 100.3L399.8 97.8L400.7 97.1L401.3 97.4L402 101.3L403.4 101.1L404.2 104.5L405.4 105.3L407.5 105.7L409.9 105.4L413.6 102L415.1 99.3L417.4 97.8L418.9 94.7L425.7 93.1L426.7 92.3L426.2 90.4L433.1 86.8L434.1 86.8L436.1 88.2L441.5 89.9L443.1 91.2L452.9 95.5L456.5 95.5L457.5 96.1L461.2 96.5L462.2 97.1L462.5 98.1Z","id_42":"M443.9 155.9L441 155.7L440.6 155.1L441.8 154L443 153.7Z","id_43":"M72.1 51.2L72.7 52.6L72.2 54.1L71 54.8L70 54.7L69 53L69.1 51.8L71.4 50.7Z","id_44":"M79.3 62.1L78.8 62.4L77.8 61.2L77.6 58L79.4 59.7Z","id_45":"M79.9 57.4L80 58.7L75.8 57L75.2 55.9L79.7 56.9Z","id_46":"M85.3 64.5L85.1 64.9L79.9 63.4L79.6 63.1L80.1 61.1L80.5 60.7L85 63.4Z","id_47":"M86.7 63.3L85.9 63.5L83.9 62L82 61.5L82.3 60.4L85 61.3Z","id_48":"M87.8 66.6L86.4 66.5L86.9 65L87.9 65.9Z","id_49":"M89.5 65.4L88.4 64.2L88.9 63.3L90 64.8Z","id_50":"M95.2 60.2L96.4 60.3L95.6 62.1L94.3 61.3Z","id_51":"M100.9 59.8L101.6 61.5L100.8 63.7L99.3 62.4L99.4 61.5L97.5 61.9L97.5 61L98.6 60.2Z","id_52":"M102.8 73.8L103.4 73.4L105 74.8L104.1 75.2L102 74.1L100.6 74.5L99.5 73.9L100.4 71.8Z","id_53":"M99.7 75.3L100.9 76.7L100.1 78L99.1 77.8L98.6 78.6L97.6 76.6L98 75.9Z","id_54":"M92.4 75.5L89.6 75.6L90.5 74.3L92.2 74.8Z","id_55":"M152.1 83.8L149.6 84.8L149.3 84.4L149.8 81.9L152.4 82.4Z","id_56":"M193.5 143L191.5 143.1L189.7 144.2L186.3 144.2L182.6 143.4L182.3 142.7L183.7 141L194.8 140.7L195.8 141.9Z","id_57":"M404.6 83.2L403.6 83.1L403.3 81.8L403.9 81.4L404.4 81.8L405 82.3Z","id_58":"M327.5 77L326.2 77.2L326.3 74.8L327.9 74.8Z","id_59":"M330.7 75.2L331.8 76.7L331.1 78.1L331.6 78.9L333.4 79.2L333.8 80.1L333.4 80.5L332.6 80.8L331.2 79.7L329.6 80.1L329.7 78.4L328 77L328.2 75.4L329.5 76.1Z","id_60":"M384.3 131L383.5 131.9L384.4 128.8L385.1 128.2L386.1 125.1L386.7 125.5L386.2 127.8L384.7 129.4Z","id_61":"M383.1 130.5L382.5 131.5L381.8 131.1L381.3 128.1L382.4 128.6Z","id_62":"M337.7 108.7L336.9 109.4L336.1 108.9L334.8 109.7L334.3 109L335.2 108L337.6 107.1L338.3 107.2Z","id_63":"M323.2 31.7L322.1 31.8L322.1 31.3L323.1 29.4L322.2 28.6L322.6 26.5L323.6 27.2L324.2 29.1Z","id_64":"M311.6 37.6L310.1 37.4L309.7 34.7Z","id_65":"M363.6 155.2L362.8 155.5L365.2 152.9L366.8 153.3L364.1 154.5Z","id_66":"M353.4 151.5L352.8 152.5L352.1 152.4L350.9 151.2L351.1 150L353.1 150.2Z","id_67":"M333.2 153L336.2 153.7L335.2 154.6L333.2 153.9L332.9 153.2Z","id_68":"M358.5 88.9L359.2 90L358.8 91L359.2 91.7L357.5 92.5L353.9 91.9L352.4 90.7Z","id_69":"M78.7 126.8L77.9 126.8L76.1 125.2L77 124.9L78.7 125.7Z","id_70":"M59.2 103.8L59.6 105.3L58.5 104.3L58.3 103.1L57.1 101.9L57 99.9L59.5 102Z","id_71":"M57.1 99.4L56.3 100.2L55.1 100.2L54.9 97.3L57 98.8Z","id_72":"M53.4 95.4L51.1 94.6L50.4 93.6L50.7 92.3L51.9 92.6Z","id_73":"M39.6 77.3L39 77.8L38.1 77.3L39.3 74.3L38.2 72L39.2 72.2L40.5 74.6Z","id_74":"M19.6 48.4L18.4 48.3L15.2 46L13.1 45.5L12.2 43.7L13.1 42.8L14 43.1L19.2 46.9Z","id_75":"M275.4 126.4L274.8 126.6L273.1 124.6L274.1 122.7L275.4 123.6Z","id_76":"M287.1 83.7L287.4 85.9L288.4 84.5L289.4 84.4L290.5 85.4L290.1 86.5L288.7 87.1L287.7 86.4L287.4 87.8L286.7 88.2L286.2 87.6L286.8 86.9L286.5 85L283.9 87.9L283.1 86.3L284.1 83.8Z","id_77":"M273.6 76.1L273.8 77L271.5 77.3L272.5 76.1Z","id_78":"M260.3 135L259.9 136.6L259.3 133.8L259.8 129.8L260.5 131.7Z","id_79":"M208.8 141.7L207.2 141.5L207.4 140.6L209.2 140.4L210.2 141L210.4 141.4Z","id_80":"M218 110.7L215.9 112.5L215.8 110.2L215.2 109L216.2 105.4L217.7 104.5Z","id_81":"M284.5 181.1L283.3 181L283.5 179.6L285.6 179L288.7 176.7L289.2 178.5L287.2 180.1Z","id_82":"M297.9 155.3L296.5 157.3L295.7 157.5L295.2 156.4L294.3 156.5L295.1 155.2L296.1 155.6L297.4 154L298 154.3Z","id_83":"M294.3 154.7L292.9 155L292 156.2L291.3 156.2L290.5 157.7L289.9 157.3L289.1 157.9L287.3 157.3L289.8 155.2L288.9 154.8L291 154.9L292.7 153.9Z","id_84":"M288.2 155.5L288 156L285.3 155.9L285.3 155.4L287.2 154.3L288.4 154.7Z","id_85":"M112.6 43.4L112.1 43.1L111.9 41.4L113.4 42.2Z","id_86":"M144.5 88.2L143.4 88.6L143 87.7L144.6 87.6Z","id_87":"M28.4 51.2L26.1 49.8L27.9 50Z","id_88":"M291 89L289.8 88.8L290.3 87L291.2 88.3Z","id_89":"M287.4 113.1L286.4 114.3L285.8 114.3L284.7 112.3L285.3 111.8L287.1 112Z","id_90":"M249.7 159.4L248.9 159.4L248.8 157.9L249.5 156.3L250.6 157.2L249.4 158.7Z","id_91":"M231.5 30.3L233.8 30.1L234.2 31.5L232.4 32L231.3 30.8Z","id_92":"M231.6 39.2L230.6 38.7L230.5 37.7L231.8 37.9Z","id_93":"M262.8 143.2L261.4 143.2L261.3 142.2L262.8 142.6Z","id_94":"M230.6 155.7L229.9 155.5L229.9 153.8L231.7 153.5Z","id_95":"M219.2 106.6L218.9 108.4L218.3 107.4L218.9 106.2L219.3 106Z","id_96":"M390.7 114.5L391.2 115L388.3 113.7L388.2 113.1Z","id_97":"M364.1 79.8L363.3 80.6L359 81.2L359.9 80.3Z","id_98":"M361.3 77.3L359.7 76.9L361.1 76.2L361.8 76.7Z","id_99":"M328 79.8L326.6 79.6L327.1 78.2L327.6 78.2Z","id_100":"M374.8 144L374.7 144.5L372.5 143.2L374.2 143Z","id_101":"M289.1 175L288.2 175.4L288.2 174.6L289.6 173.4L290 173.9L289 174.3Z","id_102":"M273.8 177.9L272 177.6L273.7 176.4L275 176.5L274.8 177.3Z","id_103":"M284.8 157.5L284.5 158L283.9 157.9L284 157.3L285.1 156.5L286.5 156.8Z","ctx_104":"M206.4 23L207.7 25.7L208.3 28.2L207.9 28.5L206.1 28.1L205.5 26.2L205.3 23Z","ctx_105":"M205.3 23L202.5 24.8L203.4 28.1L202.7 30.3L201.6 31.6L200.7 31.5L199.2 29.4L198.2 29.4L197.2 27.2L195.7 26.1L199.3 25.4L204.9 21.8L205.5 21.8Z"};
  const PIN = {
    gayo: { lon: 96.85, lat: 4.62, at: 'Gayo highlands', island: 'sumatra' },
    lintong: { lon: 98.85, lat: 2.3, at: 'Lintong Nihuta', island: 'sumatra' },
    mandheling: { lon: 99.4, lat: .9, at: 'Mandailing', island: 'sumatra' },
    java: { lon: 112.5, lat: -7.7, at: 'Java', island: 'java' },
    kintamani: { lon: 115.35, lat: -8.25, at: 'Kintamani', island: 'bali' },
  };
  function mapSvg(id) {
    const pin = PIN[id];
    const land = '<g transform="scale(2.1)">' + Object.entries(ISLANDS).map(([k, d]) => `<path class="land ${k.startsWith('ctx_') ? 'ctx' : pin && pin.island === k ? 'hot' : ''}" d="${d}"/>`).join('') + '</g>';
    const marker = pin ? `<circle class="ring" cx="${X(pin.lon)}" cy="${Y(pin.lat)}" r="16"/><circle class="pinr" cx="${X(pin.lon)}" cy="${Y(pin.lat)}" r="11"/><circle class="pinc" cx="${X(pin.lon)}" cy="${Y(pin.lat)}" r="4.5"/>
      <text class="lbl" x="${+X(pin.lon) + 20}" y="${+Y(pin.lat) + 5}">${esc(pin.at)}</text>` : '';
    return `<svg viewBox="0 0 995 386" role="img" aria-labelledby="map-t"><title id="map-t">${pin ? `Map of Indonesia with ${esc(pin.at)} marked` : 'Map of Indonesia'}</title>
      <text class="sea" x="${X(96)}" y="${Y(-9.4)}">Indian Ocean</text><text class="sea" x="${X(109)}" y="${Y(-4.9)}">Java Sea</text>${land}${marker}</svg>`;
  }

  // ---------- words ----------
  const PROCESS = {
    'Wet-hulled (giling basah)': 'Hulled while the beans are still damp, the Sumatran way. It gives the heavy body and earthy, cocoa notes.',
    'Aged for years before roasting': 'Rested in the warehouse for years after harvest, the old Javanese way. The acidity fades and woody, spicy notes come through.',
    'Wet-hulled or washed': 'Most Gayo coffee is wet-hulled; some lots are washed for a cleaner cup. Bija will say which one this is.',
    'Washed or natural': 'Washed lots taste bright and clean; naturals dry in the cherry for more fruit. Bija will say which one this is.',
    Mixed: 'Each coffee in the blend is processed in its own way.',
  };
  const BREWS = (p) => {
    const u = (p.use || '').toLowerCase(), out = [];
    if (/espresso|milk|bar/.test(u)) out.push('Espresso');
    if (/cafeti/.test(u)) out.push('Cafetière');
    if (/filter/.test(u)) out.push('Filter', 'V60');
    if (/iced/.test(u)) out.push('AeroPress');
    return [...new Set(out.length ? out : ['Cafetière'])];
  };

  function freshness() {
    if (!code.r) return '';
    const age = dayNo(londonToday()) - dayNo(code.r), pos = Math.min(age, 60) / 60 * 100;
    const [title, text] = age < 7 ? [`Resting · day ${age}`, `Freshly roasted. Coffee tastes best after about a week of rest, so it will be at its best from ${ukDate(addDays(code.r, 7))}.`]
      : age <= 30 ? [`At its best · day ${age}`, `Rested ${age} days. It's best between day 7 and day 30 after roasting, so enjoy it by ${ukDate(addDays(code.r, 30))}.`]
      : age <= 60 ? [`Past its peak · day ${age}`, 'Still good to drink. The brightest flavours fade after a month, so keep the bag sealed and away from light.']
      : [`Brew it soon · day ${age}`, 'Over two months since roasting. It will taste flatter now; it is still fine for cold brew or a cafetière.'];
    return `<section class="fresh" aria-labelledby="fr-h"><div class="top"><span class="eyebrow" id="fr-h">Roasted ${esc(ukDate(code.r))}</span><b>${esc(title)}</b></div>
      <div class="scale" role="img" aria-label="Freshness: day ${age} after roasting, on a scale where day 7 to day 30 is best"><span class="dot" style="left:${pos.toFixed(1)}%"></span></div>
      <div class="ticks" aria-hidden="true"><span>Roast day</span><span>Day 7</span><span>Day 30</span><span>Day 60</span></div><p>${esc(text)}</p></section>`;
  }

  function render() {
    const p = code.b && S ? S.byId(code.b) : null;
    if (!p) return renderBad();
    const cup = code.c === 'cup', single = p.type === 'origin', pin = PIN[p.id];
    document.title = `${p.name} · Bean passport · Bija`;
    const fact = (k, v, small, soft) => `<div><dt>${k}</dt><dd class="${soft ? 'soft' : ''}">${v}${small ? `<small>${small}</small>` : ''}</dd></div>`;
    const methods = BREWS(p);
    root.innerHTML = `
      <p class="crumbs"><a href="./">Home</a> / <a href="shop.html">Shop coffee</a> / Bean passport</p>
      <section class="tr-hero">
        <div class="tr-art" style="--pbg:${S.bgFor(p)}">${S.bagArt(p)}<span class="stamp">${cup ? 'In your cup today' : 'Bean passport'}</span>${mark('pin')}</div>
        <div>
          <span class="eyebrow">${cup ? 'You scanned your cup' : 'You scanned your bag'} · ${esc(single ? 'Single origin · ' + p.where : 'Blend · Indonesia')}</span>
          <h1>${esc(p.name)}</h1>
          <p class="lede">${esc(cup ? `Your drink was made with ${p.name}. ${p.blurb}` : p.blurb)}</p>
          <ul class="tr-notes" aria-label="Tasting notes">${p.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>
          ${freshness()}
          <div class="tr-acts">${p.soon ? `<a class="btn" href="product.html?id=${p.id}">Coming soon: get notified</a>` : `<a class="btn" href="product.html?id=${p.id}">Buy this coffee · ${S.money(p.price)}</a>`}<button class="btn ghost" type="button" id="story">${IG_ICON} Share to Instagram</button></div>
          <ul class="tr-links">${p.soon ? '' : `<li><a href="product.html?id=${p.id}&amp;plan=2w">Subscribe &amp; save 10%</a></li>`}${single ? `<li><a href="app.html?view=app&amp;stamp=${p.id}">Stamp it in your Origins Passport</a></li>` : ''}${cup ? '<li><a href="app.html?view=app">Order it again</a></li>' : ''}<li><button type="button" id="share">Share</button></li></ul>
        </div>
      </section>
      ${cup ? `<section class="cupband"><img src="photos/shop/latte-pour-600.webp" alt="A latte being poured at the Bija bar" width="600" height="1067" loading="lazy" decoding="async" style="object-fit:cover"><div><b>Brewed at 2a St James's Market</b><p>Made at our bar in St James's Market, two minutes from Piccadilly Circus, with ${esc(p.name)}.</p></div></section>` : ''}

      <section class="tr-sec" aria-labelledby="facts-h">
        <div class="sec-h"><div><span class="eyebrow">Where it comes from</span><h2 id="facts-h">The facts</h2></div></div>
        <dl class="tr-facts">
          ${fact('Region', esc(p.where), esc(p.region))}
          ${fact('Altitude', esc(p.altitude))}
          ${fact('Process', esc(p.process))}
          ${fact('Sourced with', 'Kindred Forest', 'Green coffee sourcing partner')}${fact('Roasted by', 'Bija\'s baristas', 'Roasted for freshness')}
          ${fact('Farm or co-op', code.f ? esc(code.f) : 'To be published by Bija', code.f ? '' : 'We share farm names once our importer confirms them', !code.f)}
          ${code.l ? fact('Lot', esc(code.l)) : ''}
          ${code.h ? fact('Harvest', esc(code.h)) : ''}
          ${code.r ? fact('Roast date', esc(ukDate(code.r))) : ''}
        </dl>
      </section>

      <section class="tr-sec" aria-labelledby="map-h">
        <div class="tr-map">
          <figure style="margin:0">${mapSvg(p.id)}<figcaption class="small">${pin ? `${esc(pin.at)}, ${esc(p.where)}, Indonesia.` : 'Indonesia: the islands our coffees come from.'} Map data: Natural Earth (public domain).</figcaption></figure>
          <div><span class="eyebrow">On the map</span><h3 id="map-h">${esc(pin ? pin.at : 'Across the archipelago')}</h3>
            <p>${esc(single ? p.region + '. Grown at ' + p.altitude + '.' : 'Two Javanese coffees in one cup: naturally processed Arabica from Cisurupan in West Java and forest-grown Robusta from Petungkriyono in Central Java.')}</p>
</div>
        </div>
      </section>

      ${p.id === 'house' ? `<section class="tr-sec tr-forest" aria-labelledby="forest-h">
        <div class="sec-h"><div><span class="eyebrow">Wildlife Friendly® · with Kindred Forest</span><h2 id="forest-h">The forests in your cup</h2><p>Both halves of the House Blend come from places where coffee and wildlife share the land, and both are Wildlife Friendly® certified.</p></div></div>
        <div class="tr-forest-g">
          <article><span class="eyebrow">The Arabica · Cisurupan, West Java</span><h3>Home of the Javan slow loris</h3><p>Coffee grows in shaded home gardens rather than cleared fields. Through the Little Fireface Project, farmers and conservationists work together to protect the endangered Javan slow loris and the trees it lives in.</p><small>Gives the cup its chocolate, grapefruit and sweet raisin.</small></article>
          <article><span class="eyebrow">The Robusta · Petungkriyono Forest, Central Java</span><h3>Home of the Javan gibbon</h3><p>SwaraOwa works with the communities living around the gibbons' forest, pairing conservation with training so growers can produce better coffee and keep the forest standing.</p><small>Gives the cup its pine, spice and clove.</small></article>
        </div>
        <p class="small" style="margin-top:14px">Sourced and roasted with our partner Kindred Forest. Read the full story in <a href="stories.html#house">Coffee stories</a>.</p>
      </section>` : ''}

      <section class="tr-sec" aria-labelledby="j-h">
        <div class="sec-h"><div><span class="eyebrow">From farm to ${cup ? 'cup' : 'kitchen'}</span><h2 id="j-h">The journey</h2></div></div>
        <ol class="journey">
          <li><h3>Farm</h3><p>${esc(code.f ? `Grown by ${code.f}` : `Grown in ${p.where}`)}${p.altitude && p.altitude !== 'Various' ? `, ${esc(p.altitude)} up` : ''}${code.h ? `. Harvest ${esc(code.h)}` : ''}.</p></li>
          <li><h3>Processing</h3><p>${esc(PROCESS[p.process] || p.process)}</p></li>
          <li><h3>Export</h3><p>Green coffee is bagged and shipped from Indonesia to the UK.</p></li>
          <li><h3>Roasted by our baristas</h3><p>Roasted by Bija's baristas${code.r ? ` on ${esc(ukDate(code.r))}` : ''}.</p></li>
          <li class="here"><h3>${cup ? 'Your cup' : 'Your kitchen'}</h3><p>${cup ? 'Brewed at 2a St James\'s Market, London.' : 'Ground and brewed by you. Here\'s how we\'d do it.'}</p></li>
        </ol>
      </section>

      <section class="tr-sec" aria-labelledby="brew-h">
        <div class="brewcard">${mark('mk')}<div><span class="eyebrow">How we'd brew it</span><h3 id="brew-h">${esc(methods[0])}</h3>
          <p id="brew-t">${esc(S.BREW[methods[0]])}</p>
          ${methods.length > 1 ? `<div class="chips" role="group" aria-label="Brew method">${methods.map((m, i) => `<button class="chip" type="button" data-brew="${esc(m)}" aria-pressed="${i === 0}">${esc(m)}</button>`).join('')}</div>` : ''}</div></div>
      </section>

      <section class="tr-sec" aria-labelledby="more-h">
        <div class="sec-h"><div><span class="eyebrow">Taste the islands</span><h2 id="more-h">More from Indonesia</h2></div><a class="more" href="shop.html">Shop all</a></div>
        <div class="pgrid" data-more></div>
      </section>`;
    const more = S.P.filter((x) => x.type === 'origin' && !x.soon && x.id !== p.id).slice(0, 4);
    root.querySelector('[data-more]').innerHTML = more.map((x) => S.card(x)).join('');
  }

  // ---------- share to Instagram: a 1080×1920 story image made on the phone (their cup photo, or the bag), never uploaded ----------
  const IG_ICON = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".9" fill="currentColor" stroke="none"/></svg>';
  const LOOKS = {
    noir: { name: 'Noir', bg: '#0b0b0b', panel: 'rgba(11,11,11,.92)', ink: '#ffffff', sub: 'rgba(255,255,255,.75)', photo: 'grayscale(1) contrast(1.12)' },
    paper: { name: 'Paper', bg: '#f2f0ec', panel: 'rgba(255,255,255,.94)', ink: '#0b0b0b', sub: '#4a4a4a', photo: 'contrast(1.04) saturate(1.06)' },
    kopi: { name: 'Kopi', bg: '#3b2a20', panel: 'rgba(241,230,208,.95)', ink: '#2a1d14', sub: '#5c4a3c', photo: 'sepia(.35) saturate(1.15) contrast(1.05)' },
  };
  const ST = { look: 'noir', photo: null, opener: null };
  const svgImage = (markup) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(markup.includes('xmlns=') ? markup : markup.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')); });
  const rrect = (c, x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
  // the Kawung mark: four overlapping circles
  const kawung = (c, cx, cy, r, color, lw) => { c.save(); c.strokeStyle = color; c.lineWidth = lw; for (const [dx, dy] of [[0, -r], [r, 0], [0, r], [-r, 0]]) { c.beginPath(); c.arc(cx + dx, cy + dy, r, 0, Math.PI * 2); c.stroke(); } c.restore(); };
  function wrap(c, text, maxW) { const words = text.split(' '), lines = []; let line = ''; for (const w of words) { const t = line ? line + ' ' + w : w; if (c.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; } if (line) lines.push(line); return lines; }
  async function drawStory(canvas) {
    const p = S.byId(code.b), L = LOOKS[ST.look], c = canvas.getContext('2d'), W = 1080, H = 1920;
    try { await Promise.all(['900 120px Archivo', '600 36px Inter', '400 40px Inter'].map((f) => document.fonts.load(f))); } catch {}
    c.clearRect(0, 0, W, H); c.fillStyle = L.bg; c.fillRect(0, 0, W, H);
    if (ST.photo) {
      const im = ST.photo, k = Math.max(W / im.naturalWidth, H / im.naturalHeight), w = im.naturalWidth * k, h = im.naturalHeight * k;
      c.save(); c.filter = L.photo; c.drawImage(im, (W - w) / 2, (H - h) / 2, w, h); c.restore();
    } else {
      // no photo: a Kawung field and the bag itself
      c.save(); c.globalAlpha = .08; for (let y = 0; y < H + 120; y += 120) for (let x = (y / 120) % 2 ? 60 : 0; x < W + 120; x += 120) kawung(c, x, y, 26, L.ink, 3); c.restore();
      const bag = await svgImage(S.bagArt(p)); if (bag) c.drawImage(bag, (W - 560) / 2, 250, 560, 728);
    }
    // top: the Bija tag
    c.textBaseline = 'middle'; c.font = '900 52px Archivo'; const bw = c.measureText('BIJA').width; c.font = '400 32px Inter'; const where = "2a St James's Market", ww = c.measureText(where).width;
    c.fillStyle = L.panel; rrect(c, 60, 72, 148 + bw + 24 + ww + 40, 112, 56); c.fill();
    kawung(c, 128, 128, 15, L.ink, 4);
    c.fillStyle = L.ink; c.font = '900 52px Archivo'; c.fillText('BIJA', 178, 130);
    c.font = '400 32px Inter'; c.fillStyle = L.sub; c.fillText(where, 178 + bw + 24, 131);
    // bottom panel: what's in the cup
    const x = 60, w = 960, pad = 56; c.font = '900 116px Archivo'; const name = wrap(c, p.name.toLocaleUpperCase('en-GB'), w - pad * 2).slice(0, 2);
    const h = 520 + (name.length - 1) * 112, y = H - 80 - h;
    c.fillStyle = L.panel; rrect(c, x, y, w, h, 52); c.fill();
    c.textBaseline = 'alphabetic'; let ty = y + pad + 34;
    c.fillStyle = L.sub; c.font = '600 36px Inter'; c.fillText(code.c === 'cup' ? 'In my cup today' : 'Just opened', x + pad, ty);
    c.fillStyle = L.ink; c.font = '900 116px Archivo'; for (const n of name) { ty += 118; c.fillText(n, x + pad - 4, ty); }
    c.fillStyle = L.sub; c.font = '400 40px Inter'; ty += 70; c.fillText(p.type === 'origin' ? `${p.where}, Indonesia` : 'Indonesian blend', x + pad, ty);
    // tasting notes as outlined pills
    c.font = '600 32px Inter'; let px = x + pad; ty += 48;
    for (const note of p.notes.slice(0, 3)) { const tw = c.measureText(note).width + 52; if (px + tw > x + w - pad) break; c.strokeStyle = L.ink; c.lineWidth = 3; rrect(c, px, ty, tw, 68, 34); c.stroke(); c.fillStyle = L.ink; c.fillText(note, px + 26, ty + 45); px += tw + 14; }
    ty += 68 + 70; c.fillStyle = L.sub; c.font = '400 32px Inter';
    const age = code.r ? dayNo(londonToday()) - dayNo(code.r) : null;
    c.fillText(code.r ? `Roasted ${ukDate(code.r)} · day ${age} of resting` : 'Sourced with Kindred Forest', x + pad, ty);
  }
  function storyOpen(btn) {
    ST.opener = btn;
    const el = document.createElement('div'); el.className = 'st-wrap'; el.innerHTML = `<div class="st-pan" role="dialog" aria-modal="true" aria-labelledby="st-h">
      <div class="st-top"><h2 id="st-h">Share to Instagram</h2><button class="st-x" type="button" data-st="close" aria-label="Close">×</button></div>
      <div class="st-prev"><canvas width="1080" height="1920" role="img" aria-label="Preview of your story image"></canvas></div>
      <div class="st-looks" role="group" aria-label="Look">${Object.entries(LOOKS).map(([k, l]) => `<button type="button" data-look="${k}" aria-pressed="${ST.look === k}">${l.name}</button>`).join('')}</div>
      <input type="file" id="st-file" accept="image/*" capture="environment" class="st-file">
      <div class="st-acts"><label class="btn ghost" for="st-file">${ST.photo ? 'Change photo' : 'Add a photo of your cup'}</label>${ST.photo ? '<button class="btn ghost" type="button" data-st="nophoto">Use the bag</button>' : ''}<button class="btn" type="button" data-st="go">${IG_ICON} Share</button></div>
      <p class="st-note">Your photo stays on this phone. In the share sheet pick Instagram, then Story or Reel.</p></div>`;
    document.body.appendChild(el); document.body.style.overflow = 'hidden';
    drawStory(el.querySelector('canvas')); el.querySelector('.st-x').focus();
  }
  function storyRefresh() { const el = document.querySelector('.st-wrap'); if (!el) return; const f = document.activeElement?.dataset?.look || document.activeElement?.dataset?.st; el.remove(); storyOpen(ST.opener); if (f) document.querySelector(`.st-wrap [data-look="${f}"], .st-wrap [data-st="${f}"]`)?.focus(); }
  function storyClose() { document.querySelector('.st-wrap')?.remove(); document.body.style.overflow = ''; ST.opener?.focus(); }
  async function storyShare() {
    const p = S.byId(code.b), canvas = document.querySelector('.st-wrap canvas');
    await drawStory(canvas);
    const blob = await new Promise((ok) => canvas.toBlob(ok, 'image/png')); if (!blob) return S.toast('We couldn’t make the image. Try again.');
    const file = new File([blob], `bija-${p.id}.png`, { type: 'image/png' });
    try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: `${p.name} · Bija`, text: `${p.name} from ${p.where} at Bija, St James's Market.` }); return; } } catch (err) { if (err && err.name === 'AbortError') return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    S.toast('Image saved. In Instagram tap +, choose Story or Reel, and pick it from your photos.');
  }
  document.addEventListener('change', (e) => {
    if (e.target.id !== 'st-file' || !e.target.files?.[0]) return;
    const im = new Image(); im.onload = () => { ST.photo = im; storyRefresh(); }; im.onerror = () => S.toast('That photo couldn’t be opened. Try another.'); im.src = URL.createObjectURL(e.target.files[0]);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.querySelector('.st-wrap')) storyClose(); });

  function renderBad() {
    document.title = 'Bean passport · Bija';
    root.innerHTML = `<section class="tr-bad">${mark('mkbig')}<div><span class="eyebrow">Bean passport</span><h1>We couldn't read this code</h1>
      <p>The QR code may be from an older bag, or the link got cut short. Every Bija coffee is in the shop with its region, altitude and process, and our team at 2a St James's Market can tell you about the coffee in your cup.</p>
      <div class="tr-acts" style="margin-top:22px"><a class="btn" href="shop.html">Shop coffee</a><a class="btn ghost" href="app.html?view=app">Open the app</a></div></div></section>`;
  }

  document.addEventListener('click', async (e) => {
    const chip = e.target.closest('[data-brew]');
    if (chip) {
      root.querySelectorAll('[data-brew]').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      root.querySelector('#brew-h').textContent = chip.dataset.brew;
      root.querySelector('#brew-t').textContent = S.BREW[chip.dataset.brew] || '';
      return;
    }
    if (e.target.closest('#story')) return storyOpen(e.target.closest('#story'));
    const look = e.target.closest('[data-look]'); if (look) { ST.look = look.dataset.look; return storyRefresh(); }
    const st = e.target.closest('[data-st]');
    if (st) { if (st.dataset.st === 'close') storyClose(); else if (st.dataset.st === 'nophoto') { ST.photo = null; storyRefresh(); } else if (st.dataset.st === 'go') storyShare(); return; }
    if (e.target.closest('.st-wrap') && !e.target.closest('.st-pan')) return storyClose();
    if (e.target.closest('#share')) {
      const p = S.byId(code.b), data = { title: `${p.name} · Bija`, text: `${p.name} from ${p.where}, sourced with Kindred Forest and roasted by Bija's baristas.`, url: location.href };
      try { if (navigator.share) { await navigator.share(data); return; } } catch (err) { if (err && err.name === 'AbortError') return; }
      try { await navigator.clipboard.writeText(location.href); S.toast('Link copied. Paste it anywhere to share.'); } catch { S.toast('Copy the address from your browser bar to share.'); }
    }
  });

  if (!S) { root.innerHTML = '<p style="padding:40px 0">This page needs the Bija shop script. Please reload.</p>'; return; }
  render();
})();
