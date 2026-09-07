# RoadRatings project rules

Use availability.json as the only source of destination URLs and availability. Production reads https://roadratings.com/availability.json across subdomains. Previews read their own file and use previewPath/previewAvailable from that same configuration. Every internal destination link must have data-page, page-label or page-picture, and availability-badge. Include shared/navigation.css and shared/navigation.js. Test both availability states. Never mix page-specific layout rules into shared navigation defaults.

Preserve the logo byte-for-byte and the Fully Available historical files. About content belongs in about/content.json. Its three native details sections start collapsed. Keep the static architecture; scripts/build-assets.cjs only packages approved public assets. Worker routing lives in worker.mjs and wrangler.jsonc, not Pages functions. Run node scripts/build-assets.cjs and node --test tests/workers.test.mjs before publishing.

The Map app has a separate GitHub repository/account AND Cloudflare account. Never change its hosting or credentials here. It can consume the public canonical settings without shared credentials. The intended production hosts are roadratings.com (landing), home.roadratings.com (redirect to apex), about.roadratings.com (About), data.roadratings.com (external Sheets redirect), map.roadratings.com (separate app), pitch.roadratings.com (external funding redirect).

During current development do not attach domains or change the apex stopgap redirect. About is previewAvailable=true, available=false. See WORKERS-DEPLOYMENT.md for the staged launch, including making the canonical availability endpoint reachable before enabling production links.
