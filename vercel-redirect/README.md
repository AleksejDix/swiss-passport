# Old address: swiss-passport-zh.vercel.app

The site moved to Cloudflare (https://swiss-passport.com). This Vercel project only forwards the old address:
every page redirects permanently, and `/mcp` is passed through, so connectors added with the old URL keep working.

Deploy (linked to the Vercel project aleksejdix/swiss-passport-zh): `cp -R ../server/.vercel . && vercel deploy --prod`
