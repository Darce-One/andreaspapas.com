const menuButton = document.querySelector('.menu-button');
const siteNav = document.querySelector('.site-nav');

if (menuButton && siteNav) {
  menuButton.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  });
}

document.querySelectorAll('#year').forEach((year) => { year.textContent = new Date().getFullYear(); });

async function populateArchive(list) {
  const empty = document.getElementById(`${list.id}-empty`);
  try {
    const response = await fetch(list.dataset.source);
    if (!response.ok) throw new Error(`Could not load ${list.dataset.source}`);
    const entries = await response.json();
    if (!entries.length) { empty.hidden = false; return; }
    entries.forEach((entry) => {
      const item = document.createElement('li');
      const link = document.createElement('a'); link.href = entry.url;
      const date = document.createElement('time'); date.className = 'content-date'; date.dateTime = entry.rawDate; date.textContent = entry.date;
      const copy = document.createElement('span');
      const title = document.createElement('h2'); title.textContent = entry.title; copy.append(title);
      if (entry.description) { const description = document.createElement('p'); description.textContent = entry.description; copy.append(description); }
      const arrow = document.createElement('b'); arrow.setAttribute('aria-hidden', 'true'); arrow.textContent = '↗';
      link.append(date, copy, arrow); item.append(link); list.append(item);
    });
  } catch (error) {
    console.error(error);
    empty.textContent = 'The archive could not be loaded. Please try again shortly.';
    empty.hidden = false;
  }
}

document.querySelectorAll('.content-list[data-source]').forEach(populateArchive);
