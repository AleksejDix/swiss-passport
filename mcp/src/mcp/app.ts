// The app as MCP hosts show it: name, version, website and icons.

export const VERSION = "0.9.0";
export const WEBSITE = "https://swiss-passport.com";

export const APP = {
  name: "swiss-passport-zh",
  title: "Swiss Passport",
  version: VERSION,
  websiteUrl: WEBSITE,
  // Shown next to the app in AI apps that read the server's icons (the site's favicon, also as PNG).
  icons: [
    { src: `${WEBSITE}/icon-512.png`, mimeType: "image/png", sizes: ["512x512"] },
    { src: `${WEBSITE}/favicon.svg`, mimeType: "image/svg+xml", sizes: ["any"] },
  ],
};
