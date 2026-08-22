import cors from "cors";
import express from "express";
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";

const port = Number(process.env.PRINT_AGENT_PORT ?? 3421);
const jobDirectory = path.resolve(process.env.PRINT_JOB_DIRECTORY ?? "print-agent/jobs");
const printCommand = process.env.JK5802_PRINT_COMMAND;
const printArguments = process.env.JK5802_PRINT_ARGS ? JSON.parse(process.env.JK5802_PRINT_ARGS) : ["{file}"];

const app = express();
app.disable("x-powered-by");
app.use(cors({ origin: [/^http:\/\/localhost(?::\d+)?$/, /^http:\/\/127\.0\.0\.1(?::\d+)?$/] }));
app.use(express.json({ limit: "18mb" }));

function runPrintCommand(filePath) {
  if (!printCommand) return Promise.resolve("queued-dev");
  const args = printArguments.map((argument) => String(argument).replaceAll("{file}", filePath));
  return new Promise((resolve, reject) => {
    const child = spawn(printCommand, args, { windowsHide: true, stdio: "inherit", shell: false });
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolve("printed") : reject(new Error(`Printer command exited with code ${code}.`)));
  });
}

app.get("/health", (_request, response) => {
  response.json({ ok: true, printerCommandConfigured: Boolean(printCommand) });
});

app.post("/print", async (request, response) => {
  try {
    const { image, width, copies = 1 } = request.body ?? {};
    if (width !== 384 || typeof image !== "string" || !image.startsWith("data:image/png;base64,")) {
      return response.status(400).json({ ok: false, error: "Expected a 384-dot PNG data URL." });
    }
    if (copies !== 1) {
      return response.status(400).json({ ok: false, error: "The kiosk only permits one copy per request." });
    }

    await mkdir(jobDirectory, { recursive: true });
    const jobId = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    const filePath = path.join(jobDirectory, `${jobId}.png`);
    await writeFile(filePath, Buffer.from(image.split(",")[1], "base64"));
    const status = await runPrintCommand(filePath);

    response.json({ ok: true, jobId, status });
  } catch (error) {
    console.error("Print failed:", error);
    response.status(500).json({ ok: false, error: error instanceof Error ? error.message : "Print failed." });
  }
});

app.listen(port, "127.0.0.1", () => {
  console.log(`Thermal print agent listening at http://127.0.0.1:${port}`);
  if (!printCommand) {
    console.log(`Development queue mode: PNG jobs will be saved to ${jobDirectory}`);
    console.log("Set JK5802_PRINT_COMMAND and JK5802_PRINT_ARGS to connect the installed JK-5802H driver.");
  }
});
