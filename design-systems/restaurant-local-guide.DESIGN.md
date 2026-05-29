---
version: alpha
name: Restaurant Local Guide Cal Minimal
description: "Cal.com-inspired monochrome restaurant guide system: white canvas, charcoal typography, shadow-border cards, no category stripes, category color only on rank badges and top filter chips."
colors:
  canvas: "#FFFFFF"
  paper: "#FFFFFF"
  paper-soft: "#F7F7F7"
  ink: "#242424"
  body: "#4D4D4D"
  muted: "#898989"
  line: "#E6E6E6"
  link-blue: "#0067B1"
  category-japanese: "#1F3A5F"
  category-meat: "#6E2F18"
  category-korean: "#4F6F3A"
  category-noodle: "#B75A22"
  category-spicy: "#C2410C"
  category-snack: "#D97706"
  category-seafood: "#0F766E"
  category-cafe: "#B76E79"
typography:
  display:
    fontFamily: Inter, Noto Sans KR
    fontSize: 3.6rem
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.055em"
  title:
    fontFamily: Inter, Noto Sans KR
    fontSize: 1.0625rem
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.035em"
  body:
    fontFamily: Inter, Noto Sans KR
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.58
  label:
    fontFamily: Inter, Noto Sans KR
    fontSize: 0.75rem
    fontWeight: 800
    lineHeight: 1.2
rounded:
  hero: 28px
  card: 22px
  pill: 9999px
  metric: 14px
spacing:
  xs: 6px
  sm: 10px
  md: 16px
  lg: 24px
  xl: 56px
components:
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: 24px
  rank-badge:
    backgroundColor: "{colors.category-meat}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    size: 40px
  category-filter:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: 10px
  link:
    backgroundColor: "{colors.paper-soft}"
    textColor: "{colors.link-blue}"
    rounded: "{rounded.pill}"
    padding: 10px
---

## Overview

Restaurant guide pages should feel like a clean, practical local guide rather than a decorative food magazine. The system follows Cal.com's monochrome restraint: white canvas, charcoal text, generous whitespace, and subtle shadow-border surfaces. Category colors are functional only, used for filtering and recognition rather than decoration.

## Colors

- **Canvas / Paper (#FFFFFF):** The page and cards use a clean white surface.
- **Ink (#242424):** Headlines, card names, labels, and main UI text.
- **Muted (#898989):** metadata and secondary guidance.
- **Link blue (#0067B1):** Naver map/source links only.
- **Category colors:** Reserved for rank badge backgrounds, filter dots, and tiny swatches. Do not use category colors as card header fills or top stripes.

## Typography

Use Inter with Korean fallback (`Noto Sans KR`, Apple SD Gothic Neo, Malgun Gothic). Keep headings compact and confident with tight negative letter-spacing; keep body text highly readable on mobile.

## Layout

Mobile-first single-column cards, then 2-up tablet, 3-up desktop, and 4-up wide desktop. Put the category filter directly above the grid. The filter should be horizontally scrollable on mobile and sticky enough to remain easy to reach while browsing.

## Elevation & Depth

Use Cal-style shadow-border cards: a subtle 1px ring shadow plus very soft diffused elevation. Avoid heavy shadows, gradients, image decorations, and saturated backgrounds.

## Shapes

Use clean rounded cards and pill filters. Rank markers are circular badges whose background is the category color. Do not use category-colored top stripes or dark colored card headers.

## Components

- **Hero:** white card, charcoal typography, minimal pill eyebrow, faint oversized count number only.
- **Restaurant card:** white surface, no stripe, no dark category header, compact metrics, no distracting hover effect.
- **Rank badge:** category-colored circle with white rank number.
- **Top category filter:** pill buttons with category color dots; clicking a filter hides non-matching cards. `전체` resets the view.
- **Tags / chips:** neutral light gray. Do not tint every tag with the category color.
- **Metrics:** neutral light gray boxes with high-contrast labels.
- **Bottom legend:** white card; if category colors are shown, present them as small swatches only.
- **Links:** muted blue, underline on hover only.

## Category Color Map

- Japanese / ramen: navy `#1F3A5F`
- Meat / gopchang: deep brown `#6E2F18`
- Korean / soup: olive `#4F6F3A`
- Noodles / Chinese: clay orange `#B75A22`
- Mala / spicy: red-orange `#C2410C`
- Snack / fried / jeon / cutlet: amber `#D97706`
- Seafood: teal `#0F766E`
- Cafe / dessert: rose `#B76E79`

## Do's and Don'ts

Do:
- Keep Naver review counts and verification details visible.
- Make filters obvious and usable on mobile.
- Keep category color limited to filter markers, rank backgrounds, and tiny legend swatches.
- Check mobile, tablet, and desktop rendering before publishing.

Don't:
- Add category top stripes.
- Fill card headers with category colors.
- Use decorative gradients, orbit motifs, or heavy editorial styling.
- Add distracting hover/transition effects to dense restaurant cards.
