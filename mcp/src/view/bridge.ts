// The quiz card's side of the MCP Apps protocol: JSON-RPC over postMessage with the host (ChatGPT, Claude, ...).
// Replaces the App class of @modelcontextprotocol/ext-apps, which brought zod and the MCP SDK along: 440 of the
// card's 450 KB, loaded by the host every time the card is shown. Same calls and messages, only what the card uses.

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- JSON-RPC messages from the host, read field by field
type Json = Record<string, any>;
export interface ToolResult {
  isError?: boolean;
  structuredContent?: unknown;
  content?: unknown[];
  _meta?: { card?: unknown };
}
export interface HostContext {
  theme?: "light" | "dark";
}

const PROTOCOL_VERSION = "2026-01-26";
// A host that never answers must not leave the card waiting: the card then falls back to a chat message.
const TIMEOUT_MS = 30_000;

export class App {
  ontoolresult?: (result: ToolResult) => void;
  onhostcontextchanged?: (context: HostContext) => void;
  private hostCapabilities: Json = {};
  private hostContext: HostContext = {};
  private nextId = 1;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- each request resolves with its own result shape
  private pending = new Map<number, { resolve(result: any): void; reject(error: Error): void }>();

  constructor(private appInfo: { name: string; version: string }) {
    window.addEventListener("message", ({ source, data }) => {
      if (source === window.parent && data?.jsonrpc === "2.0") this.receive(data);
    });
  }

  async connect() {
    const init = await this.request("ui/initialize", {
      appCapabilities: {},
      appInfo: this.appInfo,
      protocolVersion: PROTOCOL_VERSION,
    });
    this.hostCapabilities = init.hostCapabilities ?? {};
    this.hostContext = init.hostContext ?? {};
    this.post({ method: "ui/notifications/initialized" });
    this.reportSize();
  }

  getHostCapabilities = () => this.hostCapabilities;
  getHostContext = () => this.hostContext;
  callServerTool = (params: { name: string; arguments: Json }): Promise<ToolResult> =>
    this.request("tools/call", params);
  sendMessage = (params: { role: "user"; content: Json[] }) => this.request("ui/message", params);
  updateModelContext = (params: { content: Json[] }) => this.request("ui/update-model-context", params);

  private post(message: Json) {
    window.parent.postMessage({ jsonrpc: "2.0", ...message }, "*");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the caller knows the result shape of its method
  private request(method: string, params: Json): Promise<any> {
    const id = this.nextId++;
    this.post({ id, method, params });
    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => this.settle(id, { error: { message: `${method}: no answer from the host` } }),
        TIMEOUT_MS,
      );
      this.pending.set(id, {
        resolve: (r) => (clearTimeout(timer), resolve(r)),
        reject: (e) => (clearTimeout(timer), reject(e)),
      });
    });
  }

  private settle(id: number, { result, error }: Json) {
    const waiting = this.pending.get(id);
    this.pending.delete(id);
    if (error) waiting?.reject(new Error(error.message));
    else waiting?.resolve(result);
  }

  private receive(message: Json) {
    if (!("method" in message)) return this.settle(message.id, message);
    if ("id" in message) {
      // Requests from the host: answer the ones the protocol expects, refuse the rest.
      const known = message.method === "ping" || message.method === "ui/resource-teardown";
      return this.post(
        known
          ? { id: message.id, result: {} }
          : { id: message.id, error: { code: -32601, message: `Method not found: ${message.method}` } },
      );
    }
    if (message.method === "ui/notifications/tool-result") this.ontoolresult?.(message.params);
    if (message.method === "ui/notifications/host-context-changed") {
      this.hostContext = { ...this.hostContext, ...message.params };
      this.onhostcontextchanged?.(this.hostContext);
    }
  }

  /** Tells the host the card's height, so the frame fits it (as the library's autoResize did). */
  private reportSize() {
    let queued = false;
    let last = "";
    const measure = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        const html = document.documentElement;
        const before = html.style.height;
        html.style.height = "max-content";
        const size = { width: Math.ceil(window.innerWidth), height: Math.ceil(html.getBoundingClientRect().height) };
        html.style.height = before;
        if (JSON.stringify(size) === last) return;
        last = JSON.stringify(size);
        this.post({ method: "ui/notifications/size-changed", params: size });
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.documentElement);
    observer.observe(document.body);
  }
}
