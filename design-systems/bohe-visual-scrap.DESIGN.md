---
version: alpha
name: Bohe Visual Scrap Vercel Archive
description: Vercel-inspired public archive for one-off visual scraps, restaurant guides, and lightweight HTML artifacts.
colors:
  primary: "#171717"
  secondary: "#4D4D4D"
  tertiary: "#0072F5"
  neutral: "#FFFFFF"
  surface: "#FFFFFF"
  surfaceMuted: "#FAFAFA"
  border: "#EBEBEB"
  develop: "#0A72EF"
  preview: "#DE1D8D"
  ship: "#FF5B4F"
typography:
  h1:
    fontFamily: Geist
    fontSize: 3rem
    fontWeight: 600
    lineHeight: 1.0
    letterSpacing: "-0.055em"
  h2:
    fontFamily: Geist
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.04em"
  body-md:
    fontFamily: Geist
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: Geist Mono
    fontSize: 0.75rem
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.04em"
rounded:
  sm: 6px
  md: 8px
  lg: 12px
  pill: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
components:
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: 24px
  badge:
    backgroundColor: "#EBF5FF"
    textColor: "#0068D6"
    rounded: "{rounded.pill}"
    padding: 8px
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    padding: 12px
---

## Overview

Bohe Visual Scrap is a small public archive of generated HTML artifacts. The home page should feel like a Vercel-style gallery: bright, precise, technical, and calm. It is not a restaurant detail page; it is the index and launchpad for artifacts, so it can be slightly more developer-gallery oriented than the Cal.com restaurant pages.

## Colors

Use a mostly achromatic Vercel palette: white canvas, near-black text, neutral gray descriptions, and shadow-borders instead of visible heavy borders. Use blue sparingly for links, focus states, and tiny archive metadata accents. Red/pink/blue workflow colors may appear only as subtle dots or category markers, not large decorative fills.

## Typography

Use Geist for headings and body. Use Geist Mono only for dates, small labels, status, and technical metadata. Headings are compressed with negative letter spacing; body copy remains readable with normal tracking.

## Layout

The home page is a centered archive with a compact header, a metrics/status strip, and a responsive card grid. The hero block should use the full archive shell width on desktop: do not impose narrow `max-width` caps on the hero heading or lead copy, so the title and Korean description read as continuous lines when viewport space allows. Desktop cards may use two columns; mobile must collapse to one column. Keep the newest artifact first.

## Elevation & Depth

Use Vercel's shadow-as-border approach instead of traditional heavy borders:

- Standard card: `box-shadow: rgba(0,0,0,0.08) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 2px, #fafafa 0 0 0 1px inset`
- Hover card: slightly stronger ring and a small upward transform.

## Shapes

Use 6px for buttons and small controls, 8px for compact cards, 12px for archive cards, and 9999px for badges.

## Components

Archive cards include date, title, description, and a small arrow affordance. Status modules use compact mono labels and neutral rings. Category/type pills may be used when useful, but should not create a colorful dashboard.

## Do's and Don'ts

Do:
- Keep the home page white, clean, and gallery-like.
- Use shadow-borders rather than heavy CSS borders.
- Keep dates and status labels in Geist Mono.
- Preserve newest-first order.
- Make entire cards clickable with clear hover affordance.

Don't:
- Do not use the old dark navy panel style on the home page.
- Do not use large gradients or colorful hero blocks.
- Do not make the page look like a generic Bootstrap list.
- Do not apply restaurant category color stripes to the archive home.
