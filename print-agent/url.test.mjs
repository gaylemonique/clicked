import assert from "node:assert/strict";
import { test } from "node:test";
import { resolvePrintAgentUrl } from "../app/print-agent-url.ts";

test("uses the loopback print agent when deployment configuration is blank", () => {
  assert.equal(resolvePrintAgentUrl(undefined), "http://127.0.0.1:3421/print");
  assert.equal(resolvePrintAgentUrl(""), "http://127.0.0.1:3421/print");
  assert.equal(resolvePrintAgentUrl("   "), "http://127.0.0.1:3421/print");
});

test("honors an explicitly configured print-agent URL", () => {
  assert.equal(resolvePrintAgentUrl(" https://printer.example/print "), "https://printer.example/print");
});
