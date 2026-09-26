#!/usr/bin/env node
// Local entry point (Claude Desktop extension): one learner, progress in a file on this computer.
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { fileStore } from "./progress.js";
import { createServer } from "./server.js";

await createServer(fileStore(), { online: false }).connect(new StdioServerTransport());
