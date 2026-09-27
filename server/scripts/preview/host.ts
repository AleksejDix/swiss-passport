// Minimal MCP Apps host for previewing the quiz card: loads card.html in iframes and sends real tool results.
import { AppBridge, PostMessageTransport } from "@modelcontextprotocol/ext-apps/app-bridge";

declare const CARD_HTML: string;
declare const SAMPLES: { label: string; result: unknown }[];

for (const sample of SAMPLES) {
  const box = document.createElement("section");
  const h = document.createElement("h3");
  h.textContent = sample.label;
  const log = document.createElement("pre");
  const iframe = document.createElement("iframe");
  iframe.srcdoc = CARD_HTML;
  box.append(h, iframe, log);
  document.body.append(box);

  // Like ChatGPT and Claude: the card may call tools and update the model's context. A click gets the next sample.
  const bridge = new AppBridge(null, { name: "preview-host", version: "0" }, { openLinks: {}, logging: {}, serverTools: {}, updateModelContext: {} });
  bridge.oninitialized = () => bridge.sendToolResult(sample.result as never);
  bridge.onmessage = async (params) => {
    log.textContent += `chat message from card: ${JSON.stringify(params.content)}\n`;
    return {};
  };
  bridge.oncalltool = async (params) => {
    log.textContent += `tool call from card: ${JSON.stringify(params)}\n`;
    return SAMPLES[(SAMPLES.indexOf(sample) + 1) % SAMPLES.length].result as never;
  };
  bridge.onupdatemodelcontext = async (params) => {
    log.textContent += `model context from card: ${JSON.stringify(params.content)}\n`;
    return {};
  };
  bridge.onsizechange = ({ height }) => {
    if (height) iframe.style.height = `${height}px`;
  };
  await bridge.connect(new PostMessageTransport(iframe.contentWindow!, iframe.contentWindow!));
}
