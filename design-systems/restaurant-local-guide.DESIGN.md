---
version: alpha
name: Restaurant Local Guide Warm Editorial
description: "Mastercard-inspired warm editorial system adapted for Korean restaurant guide pages: putty cream canvas, black circular rank markers, soft paper cards, restrained orange accents, and muted blue map links."
colors:
  primary: "#141413"
  canvas: "#F3F0EE"
  paper: "#FCFBFA"
  paper-soft: "#F7F3EE"
  ink: "#141413"
  charcoal: "#262627"
  body: "#555555"
  muted: "#6F6A64"
  line: "#D8D2CA"
  line-soft: "#E8E1D9"
  accent-orange: "#D96B2B"
  accent-red: "#EB001B"
  link-blue: "#2F6F9F"
  on-dark: "#FFFFFF"
typography:
  display:
    fontFamily: Noto Sans KR
    fontSize: 3.25rem
    fontWeight: 850
    lineHeight: 1.05
    letterSpacing: "-0.045em"
  title:
    fontFamily: Noto Sans KR
    fontSize: 1.125rem
    fontWeight: 850
    lineHeight: 1.25
    letterSpacing: "-0.035em"
  body:
    fontFamily: Noto Sans KR
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.62
  label:
    fontFamily: Noto Sans KR
    fontSize: 0.75rem
    fontWeight: 850
    lineHeight: 1.2
    letterSpacing: "0.04em"
rounded:
  card: 28px
  hero: 36px
  pill: 1000px
  metric: 18px
spacing:
  xs: 6px
  sm: 10px
  md: 16px
  lg: 24px
  xl: 36px
components:
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: 18px
  rank-badge:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.pill}"
    size: 40px
  info-pill:
    backgroundColor: "{colors.paper-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: 9px
  link:
    textColor: "{colors.link-blue}"
---

## Overview

Restaurant guide pages should feel like a warm editorial city guide rather than a generic data dashboard. The system is adapted from Mastercard's warm cream editorial language, but tuned for Korean local restaurant lists: practical facts stay dense and readable, while the page atmosphere remains calm, premium, and food-friendly.

## Colors

- **Canvas (#F3F0EE):** Putty cream page background. Avoid sterile white full-page backgrounds.
- **Paper (#FCFBFA):** Raised cards and hero surfaces.
- **Ink (#141413):** Headlines, circular rank badges, primary labels.
- **Accent orange (#D96B2B):** Small editorial dots, eyebrows, and emphasis only. Do not flood cards with orange.
- **Link blue (#2F6F9F):** Naver map and source links. Muted blue keeps link affordance without clashing with the warm palette.

## Typography

Use Korean-first Noto Sans KR with tight editorial headings. Headlines should be confident and compact; body text should stay highly legible on mobile.

## Layout

Mobile-first single-column cards, then 2-up tablet, 3-4-up desktop depending on content density. Large restaurant lists must keep quick-pick sections and verification notes readable without horizontal overflow.

## Elevation & Depth

Use paper-on-paper depth: soft shadows, hairline borders, warm cream surfaces. Avoid glossy gradients and decorative hero images unless specifically requested.

## Shapes

Use rounded cards and pills. Rank markers are always black circular badges with white numbers. Criteria/legend chips use warm cream/brown tones, never purple or saturated default blue.

## Components

- **Hero:** use a dark warm-black editorial hero with orange/red orbit circles and a large ghost count number so the design change is visually unmistakable.
- **Restaurant card:** paper background, warm border, compact metrics, no hover lift; add a bold top accent strip so cards do not read as plain cream boxes.
- **Rank badge:** black circle, white number.
- **Tags / legend pills:** warm cream fill, brown/ink text.
- **Links:** muted blue, underline on hover only.
- **Metrics:** soft cream boxes with high-contrast labels.

## Do's and Don'ts

Do:
- Keep Naver review counts and verification details visible.
- Use restrained editorial accents and practical information hierarchy.
- Check mobile, tablet, and desktop rendering before publishing.

Don't:
- Use purple pills, bright default blue links, or unrelated saturated chips.
- Add decorative images to fast restaurant search artifacts by default.
- Add distracting hover/transition effects to dense restaurant cards.
