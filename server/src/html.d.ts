// HTML files imported as text (Wrangler bundles .html imports as Text modules).
declare module "*.html" {
  const html: string;
  export default html;
}
