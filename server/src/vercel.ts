// Vercel entry point (bundled to api/mcp.js, served at /mcp): stateless MCP over HTTP, progress in Upstash Redis.
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { upstashStore } from "./upstash-store.js";
import { createServer } from "./server.js";

const store = upstashStore();

async function handle(request: Request): Promise<Response> {
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  await createServer(store, { online: true }).connect(transport);
  return transport.handleRequest(request);
}

export const GET = handle;
export const POST = handle;
export const DELETE = handle;
