import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const THERMAL_PATTERN = /(?:JK[-\s]?5802|POS[-\s]?58|XP[-\s]?58|ZJ[-\s]?58|58\s?mm|thermal|receipt|xprinter|gprinter)/i;
const VIRTUAL_PATTERN = /(?:Microsoft|OneNote|Fax|PDF|XPS|DeskJet|LaserJet|OfficeJet)/i;
const KNOWN_USB_DEVICES = [
  { vendorId: "0483", productId: "5743", name: "Printer POS-58 / JK-5802H" },
];

const usbPrintScript = path.resolve("print-agent/windows-usb-print.ps1");

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true, shell: false, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) resolve(stdout.trim());
      else reject(new Error(stderr.trim() || `${command} exited with code ${code}.`));
    });
  });
}

function scorePrinter(printer) {
  const identity = `${printer.Name ?? ""} ${printer.DriverName ?? ""}`;
  if (VIRTUAL_PATTERN.test(identity)) return -100;
  let score = 0;
  if (THERMAL_PATTERN.test(identity)) score += 80;
  if (/^USB\d+$/i.test(printer.PortName ?? "")) score += 20;
  if (printer.WorkOffline === true || Number(printer.PrinterStatus) === 7) score -= 30;
  return score;
}

export function selectThermalPrinter(printers, preferredName = process.env.THERMAL_PRINTER_NAME) {
  if (preferredName) {
    return printers.find((printer) => printer.Name?.toLowerCase() === preferredName.toLowerCase()) ?? null;
  }
  const ranked = printers.map((printer) => ({ printer, score: scorePrinter(printer) })).sort((a, b) => b.score - a.score);
  return ranked[0]?.score >= 60 ? ranked[0].printer : null;
}

export async function listWindowsPrinters() {
  if (process.platform !== "win32") return [];
  const script = "Get-CimInstance Win32_Printer | Select-Object Name,DriverName,PortName,PrinterStatus,WorkOffline,Default | ConvertTo-Json -Compress";
  const output = await run("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", script]);
  if (!output) return [];
  const parsed = JSON.parse(output);
  return Array.isArray(parsed) ? parsed : [parsed];
}

export async function listUsbPrinterInterfaces() {
  if (process.platform !== "win32") return [];
  const output = await run("powershell.exe", [
    "-NoProfile",
    "-NonInteractive",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    usbPrintScript,
    "-ListOnly",
  ]);
  if (!output) return [];
  return output.split(/\r?\n/).map((devicePath) => {
    const upperPath = devicePath.toUpperCase();
    const known = KNOWN_USB_DEVICES.find(({ vendorId, productId }) => upperPath.includes(`VID_${vendorId}&PID_${productId}`));
    return {
      path: devicePath,
      name: known?.name ?? "USB printer",
      supported: Boolean(known),
      vendorId: known?.vendorId ?? null,
      productId: known?.productId ?? null,
    };
  });
}

export async function discoverPrinter() {
  const usbDevices = await listUsbPrinterInterfaces().catch(() => []);
  const usbDevice = usbDevices.find((device) => device.supported) ?? null;
  if (usbDevice) {
    return { detected: true, ready: true, mode: "usb-direct", name: usbDevice.name, device: usbDevice, queue: null, usbDevices };
  }
  const queues = await listWindowsPrinters().catch(() => []);
  const queue = selectThermalPrinter(queues);
  if (queue) {
    const offline = queue.WorkOffline === true || Number(queue.PrinterStatus) === 7;
    return { detected: true, ready: !offline, mode: "windows-queue", name: queue.Name, device: null, queue, usbDevices };
  }
  return { detected: false, ready: false, mode: null, name: null, device: null, queue: null, usbDevices };
}

export function buildEscPosRaster(grayscale, width, height) {
  if (grayscale.length !== width * height) throw new Error("Raster data dimensions do not match its pixel buffer.");
  const widthBytes = Math.ceil(width / 8);
  const raster = Buffer.alloc(8 + widthBytes * height);
  raster.set([0x1d, 0x76, 0x30, 0x00, widthBytes & 0xff, (widthBytes >> 8) & 0xff, height & 0xff, (height >> 8) & 0xff]);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (grayscale[y * width + x] < 145) {
        raster[8 + y * widthBytes + Math.floor(x / 8)] |= 0x80 >> (x % 8);
      }
    }
  }
  return raster;
}

export async function pngToEscPos(pngBuffer) {
  const { data, info } = await sharp(pngBuffer)
    .flatten({ background: "#ffffff" })
    .resize({ width: 384, withoutEnlargement: false })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const raster = buildEscPosRaster(data, info.width, info.height);
  return Buffer.concat([
    Buffer.from([0x1b, 0x40]),
    Buffer.from([0x1b, 0x61, 0x01]),
    raster,
    Buffer.from([0x1b, 0x64, 0x05]),
  ]);
}

export async function writeDirectUsb(dataFile, device) {
  const match = device?.vendorId && device?.productId ? `VID_${device.vendorId}&PID_${device.productId}` : "VID_0483&PID_5743";
  return run("powershell.exe", [
    "-NoProfile",
    "-NonInteractive",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    usbPrintScript,
    "-DataFile",
    path.resolve(dataFile),
    "-DeviceMatch",
    match,
  ]);
}
