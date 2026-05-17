# moatrics-marketing

Static marketing site for [moatrics.com](https://moatrics.com).
Built with Astro 4 + TailwindCSS. Output is plain HTML/CSS — crawlable by
Google on first request, no JS hydration required.

The Streamlit app lives separately at `app.moatrics.com` (different repo).
Sign In / Get Started links on this site point there.

## Stack

- **Astro 4.16** — static site generator (`output: 'static'`)
- **Tailwind 3** — utilities; design tokens live in `src/styles/global.css`
- **@astrojs/sitemap** — auto-generates `sitemap-index.xml` at build time
- No React/Vue. Tiny bits of vanilla JS for the mobile drawer + pricing toggle.

## Commands

```bash
npm install         # one-time
npm run dev         # local dev at http://localhost:4321
npm run build       # produces dist/
npm run preview     # serves dist/ at http://localhost:4321
```

## Project layout

```
moatrics-marketing/
├── astro.config.mjs       # site URL + sitemap integration
├── tailwind.config.mjs    # extended theme mirroring --mx-* tokens
├── tsconfig.json
├── public/
│   ├── moatrics-logo.png  # brand mark
│   ├── og-image.png       # 1200x630 (TODO — currently a marker file)
│   └── robots.txt
└── src/
    ├── components/
    │   ├── Navbar.astro       # sticky glass pill + mobile drawer
    │   ├── Footer.astro       # 4-column grid
    │   └── LegalPage.astro    # shared shell for /terms, /privacy, /disclaimer
    ├── i18n/
    │   ├── index.ts           # t("dot.path") helper
    │   ├── en.json            # source of truth for all copy
    │   └── zh.json            # parked for Phase B
    ├── layouts/
    │   └── PublicLayout.astro # <head> SEO, fonts, JSON-LD, nav+footer
    ├── pages/
    │   ├── index.astro        # homepage (7 sections)
    │   ├── terms.astro
    │   ├── privacy.astro
    │   └── disclaimer.astro
    └── styles/
        └── global.css         # design tokens + glass primitives
```

## Design system

Purple identity, gold action, black canvas. Tokens are defined as CSS custom
properties under `:root` in `src/styles/global.css` (`--mx-bg`, `--mx-purple`,
`--mx-gold`, etc.) and mirrored into Tailwind theme extension so both
approaches stay in lockstep.

Primitives: `.mx-container` (max 1240px), `.mx-glass`, `.mx-btn` (+ primary
gold pill and secondary purple outline variants), `.mx-eyebrow`,
`.mx-section` / `.mx-section-tight`.

## Contact email

The **only** contact email anywhere on this site is **service@moatrics.com**.

## TODO (Phase B+)

- `/og-image.png` — produce the real 1200×630 social card
- `/about` page
- `/pricing` (full page, not just the homepage teaser)
- `/features` (per-feature deep dives)
- `/blog` (MDX-based)
- ZH localisation — i18n + `[lang]` segment routing already plumbed
- Demo screenshots in the hero + features sections (Figma export → `/public/`)

## Deploy

See `DEPLOY.md`.
