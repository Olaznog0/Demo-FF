/* The public choice follows the visitor through the shared booking and thank-you flow. */
(function () {
  'use strict';
  const themes = {
    D1:['#176a65','#e8f2e9','#f9fcf8'], D2:['#285ca0','#e8f0fb','#f7faff'], D3:['#6d5443','#efe6d8','#faf6ee'], D4:['#155962','#deeeec','#f6faf9'], D5:['#5b5093','#eeeaf8','#fcfbff'],
    A1:['#24435a','#efece1','#faf7ef'], A2:['#355d4f','#e5ece0','#f7f8f2'], A3:['#2455a0','#e7eff8','#f6f9fc'], A4:['#70592f','#f0e8d8','#fcf8ef'], A5:['#333e66','#e9ecf7','#f8f9ff'],
    M1:['#214b59','#e8eee7','#faf8f1'], M2:['#234ead','#e9effb','#f8faff'], M3:['#8a4330','#f0e3d3','#fcf6ed'], M4:['#345e43','#e6eddf','#f8faf3'], M5:['#514879','#ede9f4','#faf8fe']
  };
  const params = new URLSearchParams(location.search), id = params.get('client'), client = window.PublicClientRegistry?.clients[id];
  const prefix = {lumen:'D',northline:'A',brightmove:'M'}[id];
  if (!client || !prefix) return;
  let saved;
  try { saved = sessionStorage.getItem('ocimatik-design:' + id); } catch {}
  const code = params.get('design') || saved;
  if (!code || !code.startsWith(prefix) || !Object.hasOwn(themes, code)) return;
  const [primary, accent, background] = themes[code];
  client.theme = {...client.theme, primary, accent, background, designCode:code, font:['D3','A1','A2','A4'].includes(code) ? 'Georgia, Cambria, serif' : 'Arial, Helvetica, sans-serif'};
  const url = new URL(location.href); url.searchParams.set('design', code); history.replaceState(null, '', url);
})();
