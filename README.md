# Thermal Photobooth

A full-screen, browser-based thermal photobooth for a locally connected JK-5802H printer. Guests choose a 1, 2, 4, or 6-photo strip, complete one automatic camera sequence, make a few print-safe edits, and send a 384-dot monochrome PNG to a local print agent.

## Run the kiosk

1. Install dependencies with `npm install`.
2. Start the print agent with `npm run print-agent`.
3. In a second terminal, start the web app with `npm run dev`.
4. Open `http://localhost:3000` and allow camera access.

The print agent defaults to development queue mode and saves printable PNG jobs under `print-agent/jobs`. This makes the entire flow testable before the printer is attached.

## Connect the JK-5802H

Install the printer's Windows driver and confirm that its own test page prints first. Then set:

- `JK5802_PRINT_COMMAND` to the driver's silent command-line printing program or your ESC/POS bridge.
- `JK5802_PRINT_ARGS` to a JSON array of arguments. Use `{file}` where the generated PNG path belongs.

See `.env.example` for the expected shape. The command is launched directly without a shell. This keeps printer-specific Windows integration isolated from the web app and avoids the browser print dialog.

## Print contract

`POST http://localhost:3421/print` accepts JSON with a 384-dot PNG data URL and exactly one copy. The agent validates, stores, and forwards the job. `GET /health` reports whether a physical printer command is configured.
