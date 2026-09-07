# RoadRatings

Lightweight landing page and About page, deployed using Cloudflare Workers Static Assets. No framework or content compilation is required. The dependency-free asset-copy script packages the public files for Wrangler.

- Edit About text and image references in about/content.json; upload replacements to assets/about.
- Set shared page availability in availability.json. Home, Data and About are enabled; Map and Pitch remain unavailable. Production reads the shared file from https://about.roadratings.com/availability.json.
- Deploy this preview with npx wrangler deploy. See WORKERS-DEPLOYMENT.md before changing Cloudflare build settings or domains.
- Validate with node scripts/build-assets.cjs and node --test tests/workers.test.mjs.
- Original design: index Fully Available.html and styles Fully Available.css, preserved in Git. The supplied logo is unchanged.
- Map belongs to a separate repository, GitHub account and Cloudflare account; this project does not manage its deployment.

See EDITING.md for content editing and AGENTS.md for future development rules.
