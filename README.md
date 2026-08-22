# Thermal Photobooth

A full-screen, browser-based thermal photobooth for a locally connected JK-5802H printer. Guests choose a 1, 2, 4, or 6-photo strip, complete one automatic camera sequence, make a few print-safe edits, and send a 384-dot monochrome PNG to a local print agent.

## Run the kiosk

1. Install dependencies with `npm install`.
2. Start everything with `npm run dev`.
3. Open `http://localhost:3000` and allow camera access.

The web app and print agent now start together. The welcome screen unlocks automatically when a supported USB printer is connected and powers on.

## Connect the JK-5802H

The bundled agent recognizes the connected POS-58 / JK-5802H hardware (`VID_0483:PID_5743`) directly through Windows USB Printing Support. It does not require a Windows printer queue, a browser print dialog, or environment-variable setup.

At startup and every health check, the agent searches active USB printer interfaces. It converts the 384-dot receipt PNG into ESC/POS raster bytes and writes them to the detected USB interface. Unplugging the printer locks the Start button; plugging it back in unlocks the kiosk within about three seconds.

`JK5802_PRINT_COMMAND` remains available only as an optional fallback for different printer hardware.

## Print contract

`POST http://localhost:3421/print` accepts JSON with a 384-dot PNG data URL and exactly one copy. `GET /health` reports live USB detection, readiness, printer identity, and connection mode.

## Automatic thermal lighting

The print pipeline preserves grayscale camera detail, analyzes the usable tones in every receipt, lifts underexposed shadows, and applies Floyd–Steinberg dithering before generating ESC/POS raster bytes. True black text and borders remain solid. Brightness and contrast controls remain available under optional adjustments, but guests do not need to configure them for normal use.
