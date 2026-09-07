# Updating RoadRatings

## Easiest way to edit text and pictures

On GitHub, open about/content.json and click the pencil (Edit). All About content lives here; the layout is separate.

- Each section has a title, a paragraphs list, and an images list.
- Replace text inside the double quotes in paragraphs. Each list item becomes one paragraph. Keep the commas between items. Use \" for quotation marks within text.
- To replace a photo, upload it to assets/about using GitHub's Add file > Upload files. Then change its src in content.json to /assets/about/your-photo.jpg.
- Update alt to describe the photo, and caption to its visible caption (or an empty string to hide it). source is for recording attribution; it is not displayed.
- Set open to false to start a section collapsed. Readers can always open or close each section independently.
- Commit the changes to main. Cloudflare's connected deployment picks them up. No build command is needed.

You can also send revised copy and photos to Codex and ask it to update the relevant section.

## Turn pages on or off

Edit availability.json in this repository. Change available to true or false under the page name, then commit. URLs and labels are also stored there. All production RoadRatings pages load the one file at https://about.roadratings.com/availability.json, without a cached fallback; open pages refresh every minute and when returning to the tab. Failed settings requests disable navigation until a successful retry.

Home, Data and About are enabled in production. Map and Pitch remain disabled. About can also be previewed directly at /about/; navigation availability is not access control.

## Deploy and launch

Use WORKERS-DEPLOYMENT.md for current Workers instructions. The earlier Pages setup has been replaced. Development Home and About links use previewPath; previewAvailable can override production availability in previews. Production About is now enabled on its verified custom domain.

## Future pages and existing external pages

Use shared/navigation.css and shared/navigation.js on every future page, and the data-page markup shown in about/index.html for every internal destination link, including logos. Include page-label or page-picture and availability-badge children. Available and unavailable states are built into the shared styles. Unavailable links have no href and are skipped by keyboard navigation.

For separately hosted pages, load these shared files from https://about.roadratings.com/shared/ and permit that origin in their Content Security Policy for scripts, styles and connections. Every integrated production subdomain reads the canonical availability file on About. Data currently redirects to Google Sheets, whose interface this repository cannot modify.

Local and pages.dev previews read their local availability.json so unpublished settings can be tested without affecting production. Data destination URLs still point to their real subdomains.

## Preserved original

index Fully Available.html and styles Fully Available.css are unchanged historical snapshots. They deliberately do not read live availability. Do not use the snapshot as a template for future pages. The original logo bytes are shared and unchanged.

## Placeholder photos

The six placeholders are remote Pexels photos; sources and photographer credits are recorded in about/content.json. Replace them with local images before final publication if you want to remove the third-party image dependency. Helmeted riders are placeholders, not portraits of Rudy.
