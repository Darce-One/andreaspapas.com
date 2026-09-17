import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const collections = {
  writings: { label: 'Writings', eyebrow: 'Writing', archive: 'writings.html', heading: 'All writings' },
  projects: { label: 'Projects', eyebrow: 'Project', archive: 'projects.html', heading: 'All projects' },
};
const localAsset = /^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/;

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#039;');

const displayDate = (value) => new Intl.DateTimeFormat('en-GB', {
  month: 'long', ...(value.length === 7 ? {} : { day: 'numeric' }), year: 'numeric', timeZone: 'UTC',
}).format(new Date(`${value}${value.length === 7 ? '-01' : ''}T00:00:00Z`));

function parsePost(source, filename) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`${filename} needs YAML front matter between --- lines.`);
  const metadata = Object.fromEntries(match[1].split(/\r?\n/).filter(Boolean).map((line) => {
    const separator = line.indexOf(':');
    if (separator < 0) throw new Error(`Invalid front matter in ${filename}: ${line}`);
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
    return [key, value];
  }));
  if (!metadata.title || !metadata.date) throw new Error(`${filename} needs title and date.`);
  if (!/^\d{4}-\d{2}(?:-\d{2})?$/.test(metadata.date)) throw new Error(`${filename} needs a YYYY-MM or YYYY-MM-DD date.`);
  return { ...metadata, body: match[2].trim() };
}

function youtubeEmbed(url) {
  try {
    const parsed = new URL(url);
    const playlist = parsed.hostname.endsWith('youtube.com') && parsed.searchParams.get('list')?.match(/^[\w-]+$/)?.[0];
    if (playlist) return { id: null, playlist, start: null };
    const id = parsed.hostname === 'youtu.be'
      ? parsed.pathname.slice(1).match(/^[\w-]{11}$/)?.[0]
      : parsed.hostname.endsWith('youtube.com')
        ? (parsed.searchParams.get('v') || parsed.pathname.match(/^\/(?:embed|shorts)\/([\w-]{11})/)?.[1])?.match(/^[\w-]{11}$/)?.[0]
        : null;
    const start = Number.parseInt(parsed.searchParams.get('t') || parsed.searchParams.get('start') || '', 10);
    return id ? { id, playlist: null, start: Number.isSafeInteger(start) && start >= 0 ? start : null } : null;
  } catch { /* Markdown renderer will retain invalid URLs as text. */ }
  return null;
}

function inlineMarkdown(text) {
  const code = [];
  const links = [];
  const codified = text.replace(/`([^`]+)`/g, (_, value) => {
    const token = `@@CODE_${code.length}@@`;
    code.push(`<code>${escapeHtml(value)}</code>`);
    return token;
  });
  const tokenized = codified.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_, label, href) => {
    const token = `@@LINK_${links.length}@@`;
    links.push(`<a href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`);
    return token;
  });
  return escapeHtml(tokenized)
    .replace(/@@LINK_(\d+)@@/g, (_, index) => links[index])
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/@@CODE_(\d+)@@/g, (_, index) => code[index]);
}

function renderMarkdown(markdown) {
  const blocks = [];
  let paragraph = [];
  let list = [];
  let listType = '';
  let quote = [];
  const flushParagraph = () => { if (paragraph.length) blocks.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`); paragraph = []; };
  const flushList = () => { if (list.length) blocks.push(`<${listType}>${list.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('')}</${listType}>`); list = []; listType = ''; };
  const flushQuote = () => {
    if (!quote.length) return;
    const lines = quote.map((line) => line.trim());
    const attribution = lines.at(-1)?.match(/^[—–-]\s*(.+)$/)?.[1];
    if (attribution) lines.pop();
    const paragraphs = lines.join('\n').split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);
    blocks.push(`<blockquote>${paragraphs.map((item) => `<p>${inlineMarkdown(item.replace(/\s*\n\s*/g, ' '))}</p>`).join('')}${attribution ? `<cite>— ${inlineMarkdown(attribution)}</cite>` : ''}</blockquote>`);
    quote = [];
  };
  for (const line of markdown.split(/\r?\n/)) {
    const heading = line.match(/^(#{2,5})\s+(.+)$/);
    const quoteLine = line.match(/^>\s?(.*)$/);
    const unordered = line.match(/^[-*]\s+(.+)$/);
    const ordered = line.match(/^\d+\.\s+(.+)$/);
    const image = line.match(/^!\[([^\]]*)\]\((https?:\/\/[^\s)]+|[a-zA-Z0-9][a-zA-Z0-9._/-]*)\)$/);
    const video = line.match(/^!youtube\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)$/i);
    const bareVideo = line.match(/^(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s]+)$/);
    if (!line.trim()) { flushParagraph(); flushList(); flushQuote(); continue; }
    if (quoteLine) { flushParagraph(); flushList(); quote.push(quoteLine[1]); continue; }
    flushQuote();
    if (heading) { flushParagraph(); flushList(); blocks.push(`<h${heading[1].length}>${inlineMarkdown(heading[2])}</h${heading[1].length}>`); continue; }
    if (video || bareVideo) {
      flushParagraph(); flushList(); const url = video ? video[2] : bareVideo[1]; const embed = youtubeEmbed(url);
      if (embed) {
        const source = embed.playlist
          ? `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(embed.playlist)}`
          : `https://www.youtube-nocookie.com/embed/${embed.id}${embed.start === null ? '' : `?start=${embed.start}`}`;
        blocks.push(`<figure class="video-embed"><iframe src="${source}" title="${escapeHtml(video?.[1] || 'YouTube video')}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></figure>`);
      }
      else blocks.push(`<p>${inlineMarkdown(url)}</p>`);
      continue;
    }
    if (image) { flushParagraph(); flushList(); const src = /^https?:/.test(image[2]) ? image[2] : `../../assets/${image[2]}`; if (localAsset.test(image[2]) || /^https?:/.test(image[2])) blocks.push(`<img src="${escapeHtml(src)}" alt="${escapeHtml(image[1])}" loading="lazy" />`); continue; }
    if (unordered || ordered) { flushParagraph(); const nextType = unordered ? 'ul' : 'ol'; if (listType && listType !== nextType) flushList(); listType = nextType; list.push((unordered || ordered)[1]); continue; }
    flushList(); paragraph.push(line.trim());
  }
  flushParagraph(); flushList(); flushQuote(); return blocks.join('\n');
}

function page(post, slug, collection) {
  const section = collections[collection];
  const subtitle = post.subtitle ? `<p class="post-subtitle">${escapeHtml(post.subtitle)}</p>` : '';
  const externalLink = post.link ? `<p><a class="back-link" href="${escapeHtml(post.link)}">${escapeHtml(post.linkLabel || 'Visit project')} ↗</a></p>` : '';
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="description" content="${escapeHtml(post.description || post.title)} — Andreas Papaeracleous." /><title>${escapeHtml(post.title)} — Andreas Papaeracleous</title><link rel="icon" href="../../assets/favicon.svg" type="image/svg+xml" /><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin /><link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Source+Code+Pro:wght@400;500&display=swap" rel="stylesheet" /><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" /><link rel="stylesheet" href="../../styles.css" /></head>
<body><a class="skip-link" href="#main">Skip to content</a><header class="site-header shell" data-site-header></header><main id="main"><article class="post"><header class="post-header"><p class="eyebrow">${section.eyebrow}</p><h1>${escapeHtml(post.title)}</h1>${subtitle}<p class="post-date">${escapeHtml(displayDate(post.date))}</p></header><div class="post-body">${renderMarkdown(post.body)}${externalLink}</div><a class="back-link" href="../${section.archive}">← ${section.heading}</a></article></main><footer class="site-footer shell" data-site-footer></footer><script src="../../script.js"></script></body></html>`;
}

for (const [name] of Object.entries(collections)) {
  const sourceDir = path.join(root, 'content', name);
  const outputDir = path.join(root, 'pages', name);
  await mkdir(path.join(root, 'data'), { recursive: true });
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });
  const files = (await readdir(sourceDir)).filter((file) => file.endsWith('.md')).sort();
  const entries = await Promise.all(files.map(async (filename) => {
    const slug = path.basename(filename, '.md');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`${filename} needs a lowercase, hyphenated filename.`);
    const post = parsePost(await readFile(path.join(sourceDir, filename), 'utf8'), filename);
    await writeFile(path.join(outputDir, `${slug}.html`), page(post, slug, name));
    const thumbnail = name === 'projects' && post.thumbnail && localAsset.test(post.thumbnail) ? `../assets/${post.thumbnail}` : '';
    return { title: post.title, description: post.description || '', thumbnail, date: displayDate(post.date), rawDate: post.date, url: `${name}/${slug}.html`, sortDate: post.date };
  }));
  entries.sort((a, b) => b.sortDate.localeCompare(a.sortDate));
  await writeFile(path.join(root, 'data', `${name}.json`), `${JSON.stringify(entries.map(({ sortDate, ...entry }) => entry), null, 2)}\n`);
  console.log(`Built ${entries.length} ${name}.`);
}
