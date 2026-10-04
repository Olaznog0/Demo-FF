import { contextUrl, validateModel } from './model.mjs';
const response = await fetch('./business-data.json', { cache: 'no-store' });
const model = await response.json();
const issues = validateModel(model);
if (!response.ok || issues.length) throw new Error('Invalid campaign identity data: ' + issues.join('; '));
const family = document.getElementById('family'), language = document.getElementById('language'), list = document.getElementById('launcher-businesses');
function render() {
  list.replaceChildren();
  for (const lead of model.businesses.filter(item => family.value === 'all' || item.family === family.value)) {
    const a = document.createElement('a'); a.className = 'launcher-card';
    a.href = contextUrl(new URL('./index.html', location.href), { lead, lang: language.value, theme: lead.defaultTheme });
    const name = document.createElement('h2'); name.textContent = lead.name;
    const address = document.createElement('p'); address.textContent = lead.address;
    const rating = document.createElement('p'); rating.className = 'launcher-rating'; rating.textContent = `${lead.google.rating} / 5 · ${lead.google.reviewCount} Google reviews`;
    const action = document.createElement('span'); action.className = 'launcher-action'; action.textContent = 'Explore five styles ↗';
    a.append(name, address, rating, action); list.append(a);
  }
}
family.addEventListener('change', render); language.addEventListener('change', render); render();
