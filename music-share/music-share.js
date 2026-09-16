(async function () {
  const list = document.querySelector('.recommendations');
  const tagCloud = document.querySelector('.tag-cloud');
  if (!list) return;

  let slugs;
  try {
    const response = await fetch('recommendations/index.json');
    if (!response.ok) throw new Error(`Could not load recommendations (${response.status})`);
    slugs = await response.json();
  } catch (error) {
    console.error('[music-share]', error);
    list.innerHTML = '<li class="load-error">Could not load recommendations.</li>';
    return;
  }

  const results = await Promise.all(slugs.map(async (slug) => {
    try {
      const response = await fetch(`recommendations/${slug}/info.json`);
      if (!response.ok) throw new Error(String(response.status));
      const data = await response.json();
      data.tags ??= data.genre ? data.genre.split('/').map((tag) => tag.trim()).filter(Boolean) : [];
      return { slug, data };
    } catch (error) { console.warn(`[music-share] skipping ${slug}`, error); return null; }
  }));

  const activeTags = new Set();
  const cards = [];
  const cloudButtons = new Map();
  const counts = new Map();

  const applyFilter = () => cards.forEach(({ element, tags }) => {
    element.classList.toggle('rec-card--hidden', activeTags.size > 0 && ![...activeTags].every((tag) => tags.includes(tag)));
  });
  const toggleTag = (tag) => {
    activeTags.has(tag) ? activeTags.delete(tag) : activeTags.add(tag);
    document.querySelectorAll(`[data-tag="${CSS.escape(tag)}"]`).forEach((button) => {
      const active = activeTags.has(tag);
      button.classList.toggle(button.classList.contains('tag-btn') ? 'tag-btn--active' : 'genre-tag--active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    applyFilter();
  };

  for (const result of results) {
    if (!result) continue;
    const { slug, data } = result;
    const tags = data.tags.map((tag) => tag.toLowerCase());
    const element = document.createElement('li'); element.className = 'rec-card';
    const image = document.createElement('img'); image.className = 'rec-art'; image.src = `recommendations/${slug}/art.jpg`; image.alt = `${data.artist ?? ''} — ${data.album ?? ''}`; image.onerror = () => image.classList.add('rec-art--missing');
    const body = document.createElement('div'); body.className = 'rec-body';
    const title = document.createElement('div'); title.className = 'rec-title-block';
    [['artist', data.artist ?? ''], ['separator', '—'], ['album', data.album ?? '']].forEach(([className, text]) => { const item = document.createElement('span'); item.className = className; item.textContent = text; title.append(item); });
    const pills = document.createElement('div'); pills.className = 'rec-tags';
    tags.forEach((tag) => { const pill = document.createElement('button'); pill.className = 'genre-tag'; pill.dataset.tag = tag; pill.textContent = tag; pill.setAttribute('aria-pressed', 'false'); pill.addEventListener('click', () => toggleTag(tag)); pills.append(pill); counts.set(tag, (counts.get(tag) ?? 0) + 1); });
    const note = document.createElement('p'); note.className = 'rec-note'; note.textContent = data.note ?? '';
    body.append(title, pills, note); element.append(image, body); list.append(element); cards.push({ element, tags });
  }

  [...counts.keys()].sort().forEach((tag) => { const button = document.createElement('button'); button.className = 'tag-btn'; button.dataset.tag = tag; button.textContent = tag; button.setAttribute('aria-pressed', 'false'); button.addEventListener('click', () => toggleTag(tag)); tagCloud?.append(button); cloudButtons.set(tag, button); });
})();
