const siteScript = document.currentScript;
const siteRoot = new URL('.', siteScript.src);
const navigationLinks = [
  ['index.html', 'Home'],
  ['pages/writings.html', 'Writings'],
  ['pages/projects.html', 'Projects'],
  ['pages/contact.html', 'Contact'],
  ['music-share/index.html', 'Music Share'],
];

const normalizePath = (url) => {
  const path = new URL(url).pathname;
  return path.endsWith('/') ? `${path}index.html` : path;
};

const currentPath = normalizePath(window.location.href);
const homeUrl = new URL('index.html', siteRoot);
const header = document.querySelector('[data-site-header]');
const footer = document.querySelector('[data-site-footer]');

if (header) {
  const links = navigationLinks.map(([path, label]) => {
    const href = new URL(path, siteRoot);
    const current = normalizePath(href.href) === currentPath ? ' aria-current="page"' : '';
    return `<a href="${href.href}"${current}>${label}</a>`;
  }).join('');

  header.innerHTML = `<a class="wordmark" href="${homeUrl.href}" aria-label="Andreas Papaeracleous home">Andreas Papaeracleous<span>.</span></a><button class="menu-button" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="site-nav"><span aria-hidden="true"></span><span aria-hidden="true"></span></button><nav id="site-nav" class="site-nav" aria-label="Main navigation">${links}</nav>`;
}

if (footer) {
  footer.innerHTML = `<a class="wordmark" href="${homeUrl.href}">Andreas Papaeracleous<span>.</span></a><nav class="footer-social" aria-label="Andreas Papaeracleous on social media"><a href="https://www.youtube.com/@andreaspapas" target="_blank" rel="noreferrer" aria-label="Visit Andreas Papaeracleous on YouTube"><i class="fa fa-youtube-play" aria-hidden="true"></i><span class="sr-only">YouTube</span></a><a href="https://www.linkedin.com/in/andreaspapas" target="_blank" rel="noreferrer" aria-label="Connect with Andreas Papaeracleous on LinkedIn"><i class="fa fa-linkedin" aria-hidden="true"></i><span class="sr-only">LinkedIn</span></a></nav><p>© <span id="year"></span> Andreas Papaeracleous.</p>`;
}

const menuButton = document.querySelector('.menu-button');
const siteNav = document.querySelector('.site-nav');

if (menuButton && siteNav) {
  menuButton.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
    });
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
      if (entry.thumbnail) {
        const thumbnail = document.createElement('img');
        thumbnail.className = 'project-thumbnail';
        thumbnail.src = entry.thumbnail;
        thumbnail.alt = '';
        thumbnail.loading = 'lazy';
        link.append(thumbnail);
      }
      const date = document.createElement('time'); date.className = 'content-date'; date.dateTime = entry.rawDate; date.textContent = entry.date;
      const copy = document.createElement('span'); copy.className = 'content-copy';
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
