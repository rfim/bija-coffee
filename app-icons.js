/* Bija Coffee app icons: 24x24 outline icons, drawn with currentColor.
   Each value is SVG inner markup; wrap with BijaIcons.svg(name, cls). */
(function () {
  // Kawung mark: four overlapping circles around (cx, cy).
  function kawung(cx, cy, r, sw) {
    var s = sw ? ' stroke-width="' + sw + '"' : '';
    return [[0, -r], [r, 0], [0, r], [-r, 0]].map(function (o) {
      return '<circle cx="' + (cx + o[0]) + '" cy="' + (cy + o[1]) + '" r="' + r + '"' + s + '/>';
    }).join('');
  }

  // Simplified Kawung for very small spots: four dots in a diamond.
  function dots(cx, cy, d, r) {
    return [[0, -d], [d, 0], [0, d], [-d, 0]].map(function (o) {
      return '<circle cx="' + (cx + o[0]) + '" cy="' + (cy + o[1]) + '" r="' + r + '" fill="currentColor" stroke="none"/>';
    }).join('');
  }

  var icons = {
    rewards:
      '<path d="M8.6 2.5h6.8l1.1 2.4H7.5z"/>' +
      '<rect x="5.6" y="4.9" width="12.8" height="2.6" rx="1.1"/>' +
      '<path d="M6.8 7.5l1.3 13.1c.05.5.45.9.95.9h5.9c.5 0 .9-.4.95-.9l1.3-13.1"/>' +
      '<path d="M7.1 10.2h9.8M7.9 18.4h8.2"/>' +
      kawung(12, 14.3, 1.55, 0.8),

    home:
      '<path d="M20.5 2.5v19"/>' +
      '<path d="M16 8.6h4.5M16 15.4h4.5"/>' +
      '<circle cx="9.5" cy="12" r="7"/>' +
      kawung(9.5, 12, 2.2, 1.3),

    menu:
      '<path d="M8.4 3.6 2.8 21.5"/>' +
      '<path d="M10.2 2.5h4.6a1.2 1.2 0 0 1 1.17.95L19 18.5H7l2.03-15.05A1.2 1.2 0 0 1 10.2 2.5z"/>' +
      '<path d="M8.3 18.5l-.3 3M17.7 18.5l.4 3"/>' +
      '<path d="M10.6 9.6h4.8v1.9a2.4 2.4 0 0 1-4.8 0z" stroke-width="1.4"/>' +
      '<path d="M9.8 15.6h6.4" stroke-width="1.4"/>' +
      '<path d="M12 5.6q-.6.8 0 1.7M14 5.6q-.6.8 0 1.7" stroke-width="1.2"/>' +
      '<circle cx="13" cy="11.4" r=".75" fill="currentColor" stroke="none"/>',

    visit:
      '<path d="M2.5 9.5Q3.6 4.2 12 2.6q8.4 1.6 9.5 6.9"/>' +
      '<path d="M2.5 9.5q3.15-1.6 6.3 0 3.2-1.6 6.4 0 3.15-1.6 6.3 0"/>' +
      '<path d="M12 2.6Q8.9 4.6 8.8 9.5M12 2.6Q15.1 4.6 15.2 9.5"/>' +
      '<path d="M12 9v12.3M7.8 14.5h8.4M10 21.3h4"/>' +
      '<path d="M3 13v8.3M3 17.2h3.2v4.1M21 13v8.3M21 17.2h-3.2v4.1"/>' +
      dots(12, 6.5, 1.3, 0.62),

    beans:
      '<g transform="rotate(-28 9 14)"><ellipse cx="9" cy="14" rx="5.2" ry="7.3"/>' +
      '<path d="M9 7.4c-2.2 2.6 2.2 4.6 0 6.6s2.2 4 0 6.6"/></g>' +
      '<g transform="rotate(32 16.8 7.6)"><path d="M14.1 11.3A3.7 5 0 1 1 20.4 9.2"/>' +
      '<path d="M16.8 3.3c-1.6 1.8 1.6 2.9 0 4.6s.6 1.9.3 2.9"/></g>',

    cup:
      '<path d="M8.2 2.8q-1.3 1.6 0 3.2M11.8 2.8q-1.3 1.6 0 3.2"/>' +
      '<path d="M4.2 8.8h12v3.9a6 6 0 0 1-12 0z"/>' +
      '<path d="M16.2 9.8h1.4a2.4 2.4 0 0 1 0 4.8h-1.8"/>' +
      '<path d="M2.8 21h16"/>' +
      kawung(10.2, 12.5, 1.6, 0.8)
  };

  window.BijaIcons = icons;
  Object.defineProperty(icons, 'svg', {
    enumerable: false,
    value: function (name, cls) {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' +
        (cls ? ' class="' + cls + '"' : '') + '>' + (icons[name] || '') + '</svg>';
    }
  });
})();
