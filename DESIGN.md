---
name: Thermal Photobooth
description: A playful kiosk that turns webcam moments into 58mm thermal keepsakes.
colors:
  booth-ink: "oklch(0.16 0.025 255)"
  booth-black: "oklch(0.08 0 0)"
  receipt-white: "oklch(1 0 0)"
  panel-white: "oklch(0.97 0.006 255)"
  shutter-honey: "oklch(0.74 0.14 77)"
  signal-blue: "oklch(0.48 0.18 254)"
  muted-ink: "oklch(0.46 0.025 255)"
  error-red: "oklch(0.50 0.19 27)"
typography:
  display:
    fontFamily: "Arial Black, Arial, sans-serif"
    fontSize: "4.5rem"
    fontWeight: 900
    lineHeight: 0.92
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.45
  label:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  control: "10px"
  panel: "14px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.shutter-honey}"
    textColor: "{colors.booth-black}"
    rounded: "{rounded.control}"
    padding: "16px 22px"
  button-secondary:
    backgroundColor: "{colors.receipt-white}"
    textColor: "{colors.booth-ink}"
    rounded: "{rounded.control}"
    padding: "14px 20px"
---

# Design System: Thermal Photobooth

## 1. Overview

**Creative North Star: "The Friendly Ticket Machine"**

The interface borrows the certainty of a physical kiosk: large labels, decisive controls, a dark machine-like shell, and one warm shutter color. The receipt itself is the visual hero and always appears as crisp white stock rather than a textured imitation.

The system is lively through language, scale, and state feedback—not decoration. It explicitly rejects generic SaaS dashboards, glassmorphism, neon cyberpunk camera interfaces, scrapbook decoration, fake paper textures, and tiny control-dense photo editors.

**Key Characteristics:**

- Oversized, distance-readable instructions
- Restrained color with honey reserved for decisive actions
- Honest monochrome receipt previews
- Fast state transitions with no decorative choreography
- Touch-first controls that remain keyboard accessible

## 2. Colors

Near-black machinery frames a pure-white receipt; shutter honey marks the next physical action, while signal blue is limited to informational focus and selection.

### Primary

- **Shutter Honey:** The capture/start color and the warm identity anchor.

### Secondary

- **Signal Blue:** Selected layout, focus, and informational status only.

### Neutral

- **Booth Ink:** Main kiosk shell and high-contrast text.
- **Receipt White:** Print surface and reversed text.
- **Panel White:** Quiet controls and secondary surfaces.
- **Muted Ink:** Supporting text that remains legible.

**The One Shutter Rule.** Honey appears only where an action advances or completes the physical workflow.

## 3. Typography

**Display Font:** Arial Black (with Arial fallback)
**Body Font:** Arial (with Helvetica and sans-serif fallback)

**Character:** A single familiar grotesque family feels industrial, immediate, and dependable on an offline Windows kiosk. Weight and size establish hierarchy without introducing a decorative display face.

### Hierarchy

- **Display** (900, 4.5rem maximum, 0.92): Welcome and countdown moments only.
- **Headline** (900, 2rem, 1): Screen instructions.
- **Title** (800, 1.25rem, 1.15): Group and panel titles.
- **Body** (500, 1rem, 1.45): Supporting guidance, capped near 65 characters.
- **Label** (800, 0.8125rem, 0.08em): Short control and status labels.

**The Three-Second Read Rule.** Every screen must communicate its current state and primary action within three seconds from several feet away.

## 4. Elevation

The kiosk is flat by default. Depth comes from contrasting solid surfaces and a short, hard offset shadow on the most tactile controls; the receipt has no soft decorative glow.

**The Physical Edge Rule.** Shadows are short and structural. If a surface looks like a floating SaaS card, remove the shadow.

## 5. Components

### Buttons

- **Shape:** Firmly curved corners (10px), never oversized capsules except compact status chips.
- **Primary:** Honey fill, near-black text, bold label, at least 48px high.
- **Hover / Focus:** Darken the fill; use a visible blue focus outline. Active state moves down by 2px.
- **Secondary:** White or transparent fill with a strong, full perimeter border.

### Chips

- **Style:** Compact monochrome status labels with a full pill shape.
- **State:** Selected layout uses signal blue and a check mark; selection never relies on color alone.

### Cards / Containers

- **Corner Style:** 14px maximum.
- **Background:** Solid panel white or booth ink.
- **Shadow Strategy:** Flat unless the container represents a physically lifted receipt.
- **Border:** Strong full perimeter borders only.
- **Internal Padding:** 16–24px.

### Inputs / Fields

- **Style:** Solid white field, 10px corners, dark perimeter border.
- **Focus:** 3px signal-blue outline.
- **Error / Disabled:** Red text plus an icon or explicit label; disabled states retain readable contrast.

### Navigation

Progress is shown as four named steps with the current step emphasized. It remains compact and never competes with the primary instruction.

### Thermal Receipt

The preview uses the real 384-dot canvas width and a 58mm visual proportion. Photos are monochrome and separated by configurable whitespace or a one-pixel border. The footer is plain, centered, and printable.

## 6. Do's and Don'ts

### Do:

- **Do** make primary touch targets at least 48px high with visible keyboard focus.
- **Do** show camera, countdown, capture number, printing, and printer-error states in plain language.
- **Do** preview the same monochrome composition sent to the print agent.
- **Do** keep every editing adjustment reversible through Start Over.

### Don't:

- **Don't** use generic SaaS dashboards, glassmorphism, or neon cyberpunk camera interfaces.
- **Don't** use scrapbook decoration or fake paper textures.
- **Don't** build a tiny control-dense photo editor.
- **Don't** use side-stripe accent borders, gradient text, decorative grids, or wide soft shadows.
- **Don't** require accounts, file management, or social sharing in the MVP.
