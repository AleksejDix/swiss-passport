// The quiz card: an MCP app view (view/card.ts) that shows the current step and checks the learner's clicks.
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Assets } from "../assets.js";
import { WEBSITE } from "./app.js";

// Hosts cache the card by this URI (ChatGPT): give it a new version when the card changes.
const CARD_URI = "ui://swiss-passport/card-v8.html";
const MIME_TYPE = "text/html;profile=mcp-app";
// The card loads nothing from the network: its script is inline and pictures come as data: URIs in the tool result.
// ChatGPT reads its own keys (widgetDomain is required in its plugin directory). The standard ui.domain is left out:
// Claude expects a hash of the server URL there, not the site's origin.
const CARD_META = {
  ui: { csp: { connectDomains: [], resourceDomains: [] } },
  "openai/widgetCSP": { connect_domains: [], resource_domains: [] },
  "openai/widgetDomain": WEBSITE,
  "openai/widgetDescription":
    "Quiz card: shows the current step (concept, question, options) and checks the learner's clicks itself. Do not repeat it in the chat.",
};

/** In a tool's _meta: its results are shown on the card. */
export const cardUi = { ui: { resourceUri: CARD_URI } };

export function registerCard(server: McpServer, assets: Assets) {
  server.registerResource("Quiz card", CARD_URI, { mimeType: MIME_TYPE, _meta: CARD_META }, async () => ({
    contents: [{ uri: CARD_URI, mimeType: MIME_TYPE, text: await assets.card(), _meta: CARD_META }],
  }));
}
