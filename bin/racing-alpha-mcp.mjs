#!/usr/bin/env node
/**
 * Racing Alpha MCP — stdio bridge.
 *
 * A zero-dependency stdio↔HTTP bridge to the hosted server at
 * https://racingalpha.co.uk/api/mcp, for MCP clients that only speak
 * the stdio transport. Clients that support Streamable HTTP should
 * connect to the remote URL directly instead.
 *
 * Usage:
 *   npx github:qtexuk/racing-alpha-mcp
 *   RACING_ALPHA_API_KEY=ra_live_… npx github:qtexuk/racing-alpha-mcp
 *
 * Protocol: newline-delimited JSON-RPC on stdin/stdout (MCP stdio
 * transport). Every message is forwarded verbatim to the remote
 * endpoint; responses are written back one per line. Notifications
 * (no id) are forwarded and produce no output, matching the remote's
 * 202-empty behaviour.
 */

import { createInterface } from "node:readline";

const ENDPOINT =
  process.env.RACING_ALPHA_MCP_URL ?? "https://racingalpha.co.uk/api/mcp";
const API_KEY = process.env.RACING_ALPHA_API_KEY;

const headers = { "Content-Type": "application/json" };
if (API_KEY) headers.Authorization = `Bearer ${API_KEY}`;

const rl = createInterface({ input: process.stdin, terminal: false });

// Sequential queue: MCP clients pipeline requests, but ordering replies
// in request order keeps every client happy and the code trivial.
let chain = Promise.resolve();

rl.on("line", (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  chain = chain.then(() => forward(trimmed)).catch(() => {});
});

rl.on("close", () => {
  chain.finally(() => process.exit(0));
});

async function forward(raw) {
  let msg;
  try {
    msg = JSON.parse(raw);
  } catch {
    write({
      jsonrpc: "2.0",
      id: null,
      error: { code: -32700, message: "Parse error" },
    });
    return;
  }
  const hasId = msg !== null && typeof msg === "object" && msg.id !== undefined;
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers,
      body: raw,
    });
    if (!hasId) return; // notification — no reply expected
    if (res.status === 202 || res.status === 204) return;
    const text = await res.text();
    if (!text) return;
    // Pass the remote's JSON-RPC reply through untouched; wrap plain
    // HTTP errors (e.g. 429 rate limit) as JSON-RPC errors.
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === "object" && "jsonrpc" in parsed) {
        write(parsed);
      } else {
        write({
          jsonrpc: "2.0",
          id: msg.id,
          error: { code: -32000, message: parsed?.error ?? `HTTP ${res.status}` },
        });
      }
    } catch {
      write({
        jsonrpc: "2.0",
        id: msg.id,
        error: { code: -32000, message: `HTTP ${res.status}` },
      });
    }
  } catch (e) {
    if (hasId) {
      write({
        jsonrpc: "2.0",
        id: msg.id,
        error: { code: -32001, message: `Upstream unreachable: ${e?.message ?? e}` },
      });
    }
  }
}

function write(obj) {
  process.stdout.write(JSON.stringify(obj) + "\n");
}
