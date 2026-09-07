# Workers preview and future domain launch

This repository owns the landing page and About page. The Map app is in a different GitHub repository/account and Cloudflare account. Do not change or attach its hostname here. Data and Pitch redirects remain separately managed.

## Deploy the preview

Worker name: rr-site-chatgpt. In Cloudflare Workers Builds, use deploy command `npx wrangler deploy` from the repository root. Remove any old `--assets .` override: wrangler.jsonc now declares the Worker entry point and the generated public directory. No separate build command is needed; Wrangler runs the small asset-copy script. It has no package dependencies and does not transform the editable content. The allowlisted public directory excludes Git files, tests, documentation, and historical snapshots.

No domains or routes are declared in wrangler.jsonc. Deployment does not register domains or change the current Google Sheets stopgap redirect.

The preview root serves Home, /about/ serves About. Both links remain within the preview. About has previewAvailable=true and available=true now that the user has connected and verified its custom domain. Map and Pitch remain unavailable. Data still goes to its real subdomain.

## Later, at launch

1. Test the deployed preview, including sections, scrolling, links, photos and mobile layout.
2. Production settings now use https://about.roadratings.com/availability.json, verified to return JSON. Keep this shared endpoint even after the apex launches. The apex settings path currently redirects to Sheets and must not be used by navigation.
3. The user has attached about.roadratings.com using Cloudflare Custom Domains and verified the page. Worker code internally serves /about/ at its root; all asset paths remain valid. After deploying the navigation fix, verify Home, Data and About are enabled and Map and Pitch remain unavailable.
4. When ready to replace the stopgap, attach roadratings.com to this Worker and disable only the apex Google Sheets redirect. Keep data.roadratings.com redirecting to Sheets.
5. Configure home.roadratings.com to redirect to https://roadratings.com, preserving path/query. The Worker has this behavior ready if that domain is later attached; existing dashboard redirects can also handle it. Do not duplicate conflicting rules.
6. About is now available=true in availability.json. The map app can independently integrate the shared navigation when ready.

## Shared navigation across accounts

Production uses https://about.roadratings.com/availability.json. It is public JSON with Access-Control-Allow-Origin: * and Cache-Control: no-store. No account credentials are needed to read it. The Map app owner may include https://about.roadratings.com/shared/navigation.js and navigation.css, add data-page markup, and allow https://about.roadratings.com in its script/style/connect CSP. Map deployment itself is outside this repository.

Text and image edits remain in about/content.json and assets/about. See EDITING.md for content editing. The original Fully Available files and logo are preserved in Git.
