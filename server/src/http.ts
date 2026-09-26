#!/usr/bin/env node
// Online entry point: HTTP server with the MCP endpoint at /mcp, progress in SQLite per learner code.
import { createServer as createHttpServer } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { sqliteStore } from "./sqlite-store.js";
import { createServer, VERSION } from "./server.js";

const PORT = Number(process.env.PORT) || 8787;
const store = sqliteStore();

const readBody = async (req: import("node:http").IncomingMessage) => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : undefined;
};

createHttpServer(async (req, res) => {
  const path = new URL(req.url ?? "/", "http://localhost").pathname;
  if (path !== "/mcp") {
    res.writeHead(path === "/" ? 200 : 404, { "content-type": "text/plain; charset=utf-8" });
    res.end(path === "/" ? `Swiss Passport quiz MCP server ${VERSION}. Connector URL: this address + /mcp\n` : "Not found\n");
    return;
  }
  try {
    // Stateless: a fresh server per request; everything the learner needs is in SQLite.
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    res.on("close", () => transport.close());
    await createServer(store, { online: true }).connect(transport);
    await transport.handleRequest(req, res, req.method === "POST" ? await readBody(req) : undefined);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.writeHead(500).end();
  }
}).listen(PORT, () => console.log(`MCP server on http://localhost:${PORT}/mcp`));
