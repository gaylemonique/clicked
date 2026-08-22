import assert from "node:assert/strict";
import test from "node:test";
import { autoToneGrayscale, buildEscPosRaster, ditherGrayscale, selectThermalPrinter } from "./printer.mjs";

const hpPrinter = {
  Name: "HP DeskJet 2700 series",
  DriverName: "Microsoft IPP Class Driver",
  PortName: "USB001",
  PrinterStatus: 3,
  WorkOffline: false,
};

test("does not mistake an ordinary USB printer for the thermal printer", () => {
  assert.equal(selectThermalPrinter([hpPrinter]), null);
});

test("automatically selects a JK-5802H Windows queue", () => {
  const thermal = {
    Name: "JK-5802H",
    DriverName: "POS-58 Printer Driver",
    PortName: "USB002",
    PrinterStatus: 3,
    WorkOffline: false,
  };
  assert.deepEqual(selectThermalPrinter([hpPrinter, thermal]), thermal);
});

test("recognizes common generic 58mm thermal queue names", () => {
  const thermal = {
    Name: "POS-58",
    DriverName: "Thermal Receipt Printer",
    PortName: "USB004",
    PrinterStatus: 3,
    WorkOffline: false,
  };
  assert.deepEqual(selectThermalPrinter([thermal]), thermal);
});

test("honors an explicit printer override without requiring name heuristics", () => {
  assert.deepEqual(selectThermalPrinter([hpPrinter], "HP DeskJet 2700 series"), hpPrinter);
});

test("encodes a one-row monochrome image as ESC/POS raster data", () => {
  const raster = buildEscPosRaster(Buffer.from([0, 255, 0, 255, 0, 255, 0, 255]), 8, 1);
  assert.deepEqual([...raster.subarray(0, 8)], [0x1d, 0x76, 0x30, 0x00, 0x01, 0x00, 0x01, 0x00]);
  assert.equal(raster[8], 0b10101010);
});

test("automatically lifts an underexposed photo while preserving true black and white", () => {
  const darkPhoto = Buffer.from([0, 18, 28, 38, 48, 58, 68, 78, 255]);
  const corrected = autoToneGrayscale(darkPhoto);
  assert.equal(corrected[0], 0);
  assert.equal(corrected.at(-1), 255);
  assert.ok(corrected[4] > 95, `expected shadow detail to be lifted, received ${corrected[4]}`);
});

test("dithering turns a dark midtone into printable detail instead of a solid black block", () => {
  const midtone = Buffer.alloc(64, 72);
  const dithered = ditherGrayscale(midtone, 8, 8);
  assert.ok(dithered.includes(0));
  assert.ok(dithered.includes(255));
});
