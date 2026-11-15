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
if (clinic.telegram) {
  const link = document.querySelector('#telegram-link');
  link.href = clinic.telegram;
  link.hidden = false;
  document.querySelector('#telegram-code').hidden = true;
}
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
  photo.src = key + '.webp';
  photo.alt = '';
  photo.width = 368;
  photo.height = 460;
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
  }
  panel.append(title, table);
  prices.append(panel);
}
