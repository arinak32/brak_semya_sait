function element(tag, value, className) {
  const node = document.createElement(tag);
  if (value) node.textContent = value;
  if (className) node.className = className;
  return node;
}

document.querySelectorAll('.phone').forEach(link => {
  link.textContent = clinic.phone;
  link.href = 'tel:' + clinic.tel;
});
document.querySelector('#whatsapp').href = clinic.whatsapp;
document.querySelector('#telegram-link').href = 'https://t.me/' + clinic.tel;
document.querySelector('#address').textContent = clinic.address;
document.querySelector('#hours').textContent = clinic.hours || 'Часы работы уточняйте по телефону.';
document.querySelector('#map').href = 'https://yandex.ru/maps/?text=' + encodeURIComponent(clinic.address);

const directions = document.querySelector('#directions');
for (const name of clinic.directions) {
  directions.append(element('li', name));
}

const doctors = document.querySelector('#doctor-list');
for (const [key, name, role, credential, description] of clinic.doctors) {
  const card = element('article', '', 'doctor');
  const photo = element('img', '', 'portrait');
  photo.src = key + '-portrait.webp';
  photo.alt = '';
  photo.width = 184;
  photo.height = 230;
  photo.loading = 'lazy';
  const body = element('div', '', 'doctor-body');
  const booking = element('a', 'Записаться на приём ↗', 'doctor-link');
  booking.href = '#contacts';
  booking.setAttribute('aria-label', 'Записаться на приём. ' + name);
  body.append(element('h3', name), element('p', role, 'role'), element('p', credential, 'credential'), element('p', description), booking);
  card.append(photo, body);
  doctors.append(card);
}

const prices = document.querySelector('#price-list');
const rubles = new Intl.NumberFormat('ru-RU');
const serviceRows = [];
for (const [group, items] of Object.entries(clinic.prices)) {
  const panel = element('details', '', 'price');
  const title = element('summary', group);
  const table = element('table');
  table.setAttribute('aria-label', group);
  const heading = table.createTHead().insertRow();
  for (const label of ['Услуга', 'Цена']) {
    const cell = element('th', label);
    cell.scope = 'col';
    heading.append(cell);
  }
  const rows = table.createTBody();
  for (const [name, cost] of items) {
    const row = rows.insertRow();
    row.insertCell().textContent = name;
    row.insertCell().textContent = rubles.format(cost) + ' ₽';
    serviceRows.push({ row, panel, text: name + ' ' + group });
  }
  panel.append(title, table);
  prices.append(panel);
}

const partners = document.querySelector('#lab-partners');
const laboratoryPanels = document.querySelector('#lab-prices');
const laboratoryRows = [];
for (const lab of clinic.laboratories) {
  const partner = element('article', '', 'lab-partner');
  const logoLink = element('a');
  logoLink.href = lab.website;
  logoLink.setAttribute('aria-label', 'Сайт лаборатории ' + lab.name);
  const logo = element('img');
  logo.src = lab.logo;
  logo.alt = lab.name;
  logo.width = 220;
  logo.height = 64;
  logoLink.append(logo);
  const jump = element('a', 'Смотреть прайс ↗', 'button outline');
  jump.href = '#' + lab.id + '-prices';
  partner.append(logoLink, jump);
  partners.append(partner);

  const section = element('section', '', 'lab-price-section');
  section.id = lab.id + '-prices';
  section.setAttribute('aria-label', 'Прайс лаборатории ' + lab.name);
  section.append(element('h3', lab.name));
  const categories = [...new Set(lab.items.map(item => item.group))];
  for (const category of categories) {
    const details = element('details', '', 'price');
    details.append(element('summary', category));
    const table = element('table');
    table.setAttribute('aria-label', lab.name + '. ' + category);
    const header = table.createTHead().insertRow();
    for (const name of ['Код', 'Исследование', 'Цена']) {
      const cell = element('th', name);
      cell.scope = 'col';
      header.append(cell);
    }
    const body = table.createTBody();
    const records = lab.items.filter(item => item.group === category);
    for (const item of records) {
      const row = body.insertRow();
      row.insertCell().textContent = item.code;
      row.insertCell().textContent = item.name;
      row.insertCell().textContent = rubles.format(item.price) + ' ₽';
      laboratoryRows.push({ row, details, section, text: (item.code + ' ' + item.name + ' ' + category + ' ' + lab.name).toLocaleLowerCase('ru') });
    }
    details.append(table);
    section.append(details);
  }
  laboratoryPanels.append(section);
}
const search = document.querySelector('#lab-search');
const status = document.querySelector('#lab-status');
const normalize = text => text.toLocaleLowerCase('ru').replaceAll('ё', 'е').trim();
function filterLaboratory() {
  const query = normalize(search.value);
  const matches = laboratoryRows.filter(item => normalize(item.text).includes(query));
  const visibleRows = new Set(matches.map(item => item.row));
  const visibleCategories = new Set(matches.map(item => item.details));
  const visibleSections = new Set(matches.map(item => item.section));
  for (const item of laboratoryRows) {
    item.row.hidden = !visibleRows.has(item.row);
    item.details.hidden = !visibleCategories.has(item.details);
    item.section.hidden = !visibleSections.has(item.section);
    if (query) item.details.open = !item.details.hidden;
  }
  status.textContent = matches.length ? 'Исследований в каталоге: ' + matches.length : 'Ничего не найдено. Попробуйте другое название или код.';
}
search.addEventListener('input', filterLaboratory);
filterLaboratory();

const serviceSearch = document.querySelector('#service-search');
const serviceStatus = document.querySelector('#service-status');
const servicePanels = [...new Set(serviceRows.map(item => item.panel))];
let servicePanelState;
function filterServices() {
  const query = normalize(serviceSearch.value);
  if (query && !servicePanelState) {
    servicePanelState = new Map(servicePanels.map(panel => [panel, panel.open]));
  }
  const matches = serviceRows.filter(item => normalize(item.text).includes(query));
  const visibleRows = new Set(matches.map(item => item.row));
  const visiblePanels = new Set(matches.map(item => item.panel));
  for (const item of serviceRows) {
    item.row.hidden = !visibleRows.has(item.row);
  }
  for (const panel of servicePanels) {
    panel.hidden = !visiblePanels.has(panel);
    if (query) panel.open = !panel.hidden;
    else if (servicePanelState) panel.open = servicePanelState.get(panel);
  }
  if (!query) servicePanelState = undefined;
  serviceStatus.textContent = matches.length ? 'Услуг в каталоге: ' + matches.length : 'Ничего не найдено. Попробуйте другое название или направление.';
}
serviceSearch.addEventListener('input', filterServices);
filterServices();

const siteHeader = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const mainNavigation = document.querySelector('#main-navigation');
const mobileNavigation = window.matchMedia('(max-width: 670px)');
function setMenuOpen(open) {
  const expanded = mobileNavigation.matches && open;
  mainNavigation.hidden = mobileNavigation.matches && !expanded;
  menuToggle.setAttribute('aria-expanded', String(expanded));
  menuToggle.setAttribute('aria-label', expanded ? 'Закрыть меню' : 'Открыть меню');
}
siteHeader.classList.add('navigation-ready');
setMenuOpen(false);
menuToggle.addEventListener('click', () => {
  setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
});
mainNavigation.addEventListener('click', event => {
  if (event.target.closest('a')) setMenuOpen(false);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    setMenuOpen(false);
    menuToggle.focus();
  }
});
document.addEventListener('click', event => {
  if (!siteHeader.contains(event.target)) setMenuOpen(false);
});
siteHeader.addEventListener('focusout', event => {
  if (!siteHeader.contains(event.relatedTarget)) setMenuOpen(false);
});
mobileNavigation.addEventListener('change', () => {
  const toggleHadFocus = document.activeElement === menuToggle;
  setMenuOpen(false);
  if (toggleHadFocus && !mobileNavigation.matches) mainNavigation.querySelector('a').focus();
});
new ResizeObserver(() => {
  document.documentElement.style.setProperty('--header-height', siteHeader.getBoundingClientRect().height + 'px');
}).observe(siteHeader);
