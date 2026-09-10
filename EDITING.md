# Updating RoadRatings

## Easiest way to edit text and pictures

Use https://app.pagescms.org and sign in with your rudyntech GitHub account. Open RR_Site_ChatGPT and select main. The repository's .pages.yml configures these forms:

1. About page: expand Summary, Deep Dive or Who Is Rudy. Edit the title or individual paragraph fields. Paragraphs now have a visual formatting toolbar: select text and use Bold or Italic, or add lists. Formatting is saved automatically; you do not need to edit HTML. Embedded images and executable content are not supported in paragraph fields; use the picture controls instead.
2. Pictures: open Main header image to replace the banner, or expand a section picture, select/upload a JPG, JPEG, PNG or WebP, and edit its description, caption and credit. Uploads go into assets/about; the original logo is outside this media folder. Use a new filename when replacing a photo to avoid old browser caches. Each section supports up to two photos. The banner and section photos display without cropping.
3. Page availability and links: change destination addresses or turn availability on/off. Off displays COMING SOON; it does not make the destination private. Read the current switches in this form for live availability.
4. Save your changes. Saving on main commits to GitHub and triggers Cloudflare publication. This configuration has no separate draft approval or pre-publication preview. Wait for deployment, then refresh the public page to check your edit.

The page keeps three sections, up to two pictures per section, and starts all sections collapsed. Preview routing settings and section IDs are retained as hidden fields. If a Pages CMS screen asks you to create configuration, refresh/reopen the repository after .pages.yml has been pushed; do not replace it with a starter template.

## Rudy's bike table

Open Rudy's bikes in Pages CMS. Edit the heading, bike names, pictures and photo credits. The list is chronological: the website fills the first column downward, then the second, then the third. Clicking a bike opens its picture; Close, Escape or clicking outside dismisses it. Photos are stored together in about/bikes. The extra EBR photo from Drive is available in Bike pictures as an alternative.

Three images are stock placeholders (Buell XB9S, Ducati Multistrada 1000, and Yamaha R6 for the 2006 R4.5). Keep the credit, source and license fields while using them. When uploading your own replacement, update or clear those fields and the placeholder note. The Ducati photo's model year is unverified; the other two placeholders are documented as 2003 XB9S and 2006 R6. Table names stay exactly as supplied by Rudy, even where Drive photo filenames have a different year.

## Alternative: edit on GitHub

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

Availability is controlled by the current settings in availability.json. About can also be previewed directly at /about/; navigation availability is not access control.

## Deploy and launch

Use WORKERS-DEPLOYMENT.md for current Workers instructions. The earlier Pages setup has been replaced. Development Home and About links use previewPath; previewAvailable can override production availability in previews. Production About is now enabled on its verified custom domain.

## Future pages and existing external pages

Use shared/navigation.css and shared/navigation.js on every future page, and the data-page markup shown in about/index.html for every internal destination link, including logos. Include page-label or page-picture and availability-badge children. Available and unavailable states are built into the shared styles. Unavailable links have no href and are skipped by keyboard navigation.

For separately hosted pages, load these shared files from https://about.roadratings.com/shared/ and permit that origin in their Content Security Policy for scripts, styles and connections. Every integrated production subdomain reads the canonical availability file on About. Data currently redirects to Google Sheets, whose interface this repository cannot modify.

Local and pages.dev previews read their local availability.json so unpublished settings can be tested without affecting production. Data destination URLs still point to their real subdomains.

## Preserved original

index Fully Available.html and styles Fully Available.css are unchanged historical snapshots. They deliberately do not read live availability. Do not use the snapshot as a template for future pages. The original logo bytes are shared and unchanged.

## About photography

The main header uses the supplied crownmoto wheelie artwork. Summary uses Latigo Canyon and Poudre Canyon; Deep Dive uses the Suzuki DL650 river and New Idria Mine photos; Who Is Rudy uses the maintenance workshop and race trophies. All seven supplied files are preserved byte-for-byte in assets/about. The header is separate from the two-photo limit for each section.
