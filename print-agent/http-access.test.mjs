import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import express from "express";
import { configureLocalAgentAccess } from "./http-access.mjs";

const productionOrigin = "https://clickedph.vercel.app";
let server;
let baseUrl;

before(async () => {
  const app = express();
  configureLocalAgentAccess(app);
  app.get("/health", (_request, response) => response.json({ ok: true }));

  server = await new Promise((resolve) => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
  });
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test("allows the Clicked! production site to reach the local print agent", async () => {
  const response = await fetch(`${baseUrl}/health`, {
    method: "OPTIONS",
    headers: {
      Origin: productionOrigin,
      "Access-Control-Request-Method": "GET",
      "Access-Control-Request-Private-Network": "true",
    },
  });

  assert.equal(response.status, 204);
  assert.equal(response.headers.get("access-control-allow-origin"), productionOrigin);
  assert.equal(response.headers.get("access-control-allow-private-network"), "true");
});

test("does not grant print-agent access to unrelated public sites", async () => {
  const response = await fetch(`${baseUrl}/health`, {
    method: "OPTIONS",
    headers: {
      Origin: "https://untrusted.example",
      "Access-Control-Request-Method": "GET",
      "Access-Control-Request-Private-Network": "true",
    },
  });

  assert.equal(response.headers.get("access-control-allow-origin"), null);
});
