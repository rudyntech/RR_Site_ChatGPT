# RoadRatings MVP Landing Page

A lightweight, production-ready static landing page for RoadRatings. The site reproduces the supplied four-quadrant design, uses the supplied RoadRatings logo image directly, and requires no JavaScript, framework, package manager, or build step.

## File structure

```text
RR_Site_ChatGPT/
├── index.html
├── styles.css
├── _headers
├── README.md
└── assets/
    └── RoadRatings-Logo.png
```

## Links

- **Map / The App:** https://map.roadratings.com
- **Data / The Spreadsheet:** https://data.roadratings.com
- **Pitch / The Plea:** https://pitch.roadratings.com
- **About / The Story:** https://about.roadratings.com
- **Center RoadRatings logo:** https://home.roadratings.com

## Cloudflare Pages deployment

1. Push this folder to a GitHub repository.
2. In Cloudflare, go to **Workers & Pages**, create/import a **Pages** project, and connect that repository.
3. Use:
   - **Production branch:** `main`
   - **Framework preset:** None
   - **Build command:** `exit 0` (or leave blank)
   - **Build output directory:** `.` (the repository root)
   - **Root directory:** leave blank
4. Deploy, then attach the desired RoadRatings custom domain in the Pages project.

No Namecheap DNS change should be necessary if `RoadRatings.com` is already using Cloudflare nameservers. The included `_headers` file adds basic security/privacy headers on Cloudflare Pages.

## Local preview

From inside the project folder:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Notes

- `assets/RoadRatings-Logo.png` is the supplied logo copied byte-for-byte and displayed directly.
- The same unmodified PNG is used as the favicon.
- The layout remains a 2×2 grid on mobile.
- There are no analytics, cookies, trackers, external fonts, scripts, or third-party runtime dependencies.

## Availability designs

The live `index.html` shows Coming Soon badges for Map, Pitch, and About. Those destinations are non-interactive until launch. Data and the center home logo retain their links.

The original design is saved as `index Fully Available.html` with its unchanged stylesheet `styles Fully Available.css`. Both designs use the same original logo asset. To restore the original as the live page, copy these two saved files over `index.html` and `styles.css`, then change the restored HTML stylesheet reference back to `styles.css`.
