# Andreas Papaeracleous

A lightweight static site for GitHub Pages. It uses plain HTML, CSS, and JavaScript, plus a small dependency-free Node script to turn Markdown content into static pages during deployment.

## Site map

- `index.html` is the home page; the remaining top-level pages are in `pages/`.
- `content/writings/` and `content/projects/` contain the Markdown sources.
- `scripts/build-content.mjs` turns that Markdown into individual HTML pages in `pages/writings/` and `pages/projects/`, and builds the archive JSON files used by their index pages.
- `music-share/` contains the Music Share page and its recommendation data/assets, carried over from its original site.
- `.github/workflows/deploy-pages.yml` builds then deploys the site to GitHub Pages whenever `main` is pushed.

Generated pages and JSON are excluded from Git; GitHub Actions creates them before publishing. Run the generator locally before previewing.

## Add a writing or project

Create a lowercase, hyphenated `.md` file in the appropriate `content/` subfolder:

```md
---
title: A useful title
date: 2026-09-16
description: A short archive summary.
subtitle: Optional standfirst for the full page.
---

Your Markdown content begins here.
```

Supported body Markdown is intentionally simple: paragraphs, `##` and `###` headings, blockquotes, ordered/unordered lists, inline links, bold, italics, code, and images. Put local images in `assets/` and reference them relative to that folder, e.g. `![Alt text](project-image.jpg)`. For a styled quote attribution, put `> — Name` as the final line of the quote block.

### Embed a YouTube video

Place either of these on its own line in the Markdown file:

```md
!youtube[Optional accessible title](https://www.youtube.com/watch?v=VIDEO_ID)
https://youtu.be/VIDEO_ID
```

The generator converts it to a privacy-enhanced YouTube embed (`youtube-nocookie.com`).

Projects may add an optional prominent outbound link:

```md
link: https://example.com
linkLabel: Visit project
```

## Preview and publish

```sh
./scripts/preview.sh
```

Then visit `http://localhost:8000`. The script rebuilds the Markdown pages and runs basic local checks before starting the server. To run the checks without opening a server, use `./scripts/preview.sh --check`; pass a custom port such as `./scripts/preview.sh 4173` when needed.

To publish, push the repository to GitHub, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**, then push to `main`.
