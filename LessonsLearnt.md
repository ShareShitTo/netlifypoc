# Lessons Learnt

## 2026-03-01 - Netlify Dev SPA rewrite collision

### Problem
- Local `netlify dev` showed a white page because `/src/main.tsx` was being rewritten to `index.html` instead of being proxied as JavaScript.

### Root cause
- SPA fallback redirects were colliding with Vite module paths during local development.

### Best-practice pattern adopted
- Use `[dev] framework = "#custom"` with `command = "pnpm dev"` and `targetPort = 5173` in `netlify.toml`.
- Keep production SPA fallback redirects in `netlify.toml` context redirects, not in `public/_redirects`.
- Avoid broad catch-all redirect files that may interfere with dev module paths.

### Why this is better
- Local dev reliably proxies Vite assets and HMR modules.
- Production and preview deploys still get SPA deep-link fallback behavior.
- Config intent is explicit and centralized in `netlify.toml`.

## 2026-03-01 - External CDN dependencies in this repo

### Markdown page (`/page3`)
- EasyMDE CSS: `https://cdn.jsdelivr.net/npm/easymde@2.20.0/dist/easymde.min.css`
- EasyMDE JS: `https://cdn.jsdelivr.net/npm/easymde@2.20.0/dist/easymde.min.js`
- Marked JS: `https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js`
- Usage:
- `EasyMDE` provides editor UI.
- `Marked` renders markdown preview HTML.

### File page (`/page4`)
- Bootstrap Icons CSS: `https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css`
- Usage:
- File-type iconography for pdf/zip/image/text/default cases.

### CDN nuance
- These pages depend on external network availability.
- UI should show clear load/error states when CDN assets fail.
- For stricter reproducibility, pin all CDN versions explicitly.

## 2026-03-01 - Blob metadata-first listing pattern

### Pattern
- Store full file payload in a blob key (e.g. `file:<id>`).
- Store list-view fields in blob metadata (`name`, `size`, `mime`, `ext`, `uploadedAt`).
- For list endpoints, call `store.list()` and `store.getMetadata(key)` only.

### Benefit
- File lists avoid reading/transferring full blob payloads.
- Better latency and lower transfer costs for list screens.

## 2026-03-01 - Theme architecture pattern for SPA best practices

### Pattern adopted
- Global theme switching through `document.documentElement.dataset.theme`.
- CSS variables define all token colors and font families.
- Component classes consume semantic tokens (`bg-card`, `text-foreground`, etc.) rather than hard-coded colors.
- Selected theme persists in localStorage key `netlifypoc.theme`.

### Why this is better
- Theme additions become data changes (new token block) rather than component rewrites.
- Global switch is route-agnostic and works uniformly across SPA pages.
- Runtime overhead is low (attribute change + CSS variable updates).

## 2026-03-01 - Additional CDN dependencies for theming

### Theme fonts
- Google Fonts CSS:
- `https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;500;700&family=Press+Start+2P&family=VT323&display=swap`
- Usage:
- `Press Start 2P` for retro 8-bit mood.
- `JetBrains Mono` for hacker mood.
- `VT323` for console/terminal amber mood.

### Geocities-style backgrounds
- `https://www.toptal.com/designers/subtlepatterns/uploads/prism.png`
- `https://www.toptal.com/designers/subtlepatterns/uploads/stardust.png`
- Usage:
- Tiled background textures for playful throwback themes.

### CDN resilience nuance
- If CDN font/texture fails, UI remains functional using fallback fonts and gradient layers.

## 2026-03-01 - Theme curation expansion and animated background practice

### Design principle used
- Build motifs, not random palettes:
- Modern editorial themes pair high-clarity neutrals with refined serif accents.
- Terminal themes pair mono-focused typography with restrained phosphor palettes.
- Nostalgia themes can be expressive but must preserve readability with layered overlays.
- Keep sizing shifts subtle to avoid layout instability (`--type-base-scale` near 1.0).

### Animated GIF background practice
- Animated backgrounds are decorative second-layer textures, not primary content.
- GIF layers are blended with gradient overlays to lower visual noise.
- Motion is automatically reduced via:
- `@media (prefers-reduced-motion: reduce)` switching GIF themes to static background variants.

### New external GIF URLs added for background themes
- `https://media.giphy.com/media/3o7TKtnuHOHHUjR38Y/giphy.gif`
- `https://media.giphy.com/media/l0MYB8Ory7Hqefo9a/giphy.gif`

### Why this pattern is reusable
- Theme registry + grouped selector supports growth without UI debt.
- Token-based CSS keeps components theme-agnostic.
- Motion accessibility is centralized in stylesheet logic rather than per-component conditionals.
