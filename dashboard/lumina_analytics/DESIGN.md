# Design System Specification: The Luminescent Analyst

## 1. Overview & Creative North Star
**Creative North Star: The Neon Precisionist**
This design system is a high-fidelity intersection between cinematic aesthetics and surgical data precision. It moves away from the "flat dashboard" era into an environment of depth, light, and editorial authority. We achieve this through "Organic Data Visualization"—where complex information is presented through smooth gradients and high-contrast typography—and a "Glassmorphism-First" philosophy that treats every interface element as a physical layer of light and shadow.

The design breaks the standard template look by utilizing **intentional asymmetry** and **tonal depth**. Rather than rigid, equal-width columns, we use overlapping glass cards and varying container heights to guide the eye toward the most critical AI-driven insights.

## 2. Colors
Our palette is rooted in the deep obsidian of the night sky, punctuated by neon frequencies that signify intelligence and action.

*   **Primary (`#ba9eff`):** Use for high-impact brand moments and key CTAs.
*   **Secondary (`#3fff8b`):** Reserved for "Positive" metrics, fit success, and growth indicators.
*   **Tertiary (`#57bcff`):** Used for analytical details and informational highlights.
*   **Neutral Layers:** A sophisticated range from `surface-container-lowest` (`#000000`) to `surface-bright` (`#1f2b49`).

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section content. Boundaries must be defined strictly through background shifts. A card (`surface-container-high`) should sit on a section (`surface-container-low`) which sits on the global `background`. The eye should perceive depth through color value transitions, not structural lines.

### Surface Hierarchy & Nesting
Treat the UI as a stack of frosted glass panels.
1.  **Level 0 (Base):** `background` (#060e20)
2.  **Level 1 (Sections):** `surface-container-low` (#091328)
3.  **Level 2 (Cards):** `surface-container-highest` (#192540)
4.  **Level 3 (Floating/Active):** `surface-bright` (#1f2b49) with 20px backdrop blur.

### The Glass & Gradient Rule
Floating elements (modals, tooltips, popovers) must use semi-transparent versions of `surface-variant` with a 16px to 32px `backdrop-filter: blur()`. Main CTAs must never be flat; use a linear gradient from `primary` to `primary-dim` at a 135-degree angle to provide a "lit from within" soul.

## 3. Typography
We utilize a high-contrast pairing: **Space Grotesk** for mathematical authority and **Manrope** for human readability.

*   **Display (Space Grotesk):** Large, bold, and aggressive. Use `display-lg` (3.5rem) for hero metrics like "Fit Score."
*   **Headline (Space Grotesk):** `headline-md` (1.75rem) provides clear, editorial section breaks.
*   **Body (Manrope):** `body-lg` (1rem) is the workhorse. The generous x-height of Manrope ensures legibility against dark backgrounds.
*   **Label (Manrope):** `label-md` (0.75rem) in `on-surface-variant` is used for micro-data, ensuring it doesn't compete with primary information.

The hierarchy communicates a "Data Editorial" vibe—the headlines act as news, while the metrics act as proof.

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering**, mimicking how light travels through thick glass.

*   **The Layering Principle:** To lift a card, do not reach for a shadow first; reach for a lighter surface token. Place a `surface-container-highest` card on a `surface-container` background.
*   **Ambient Shadows:** If a floating effect is required (e.g., a modal), use a massive blur (40px-60px) with 6% opacity. The shadow color should be a tinted `#000000` to ground the element in the dark environment.
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke, use `outline-variant` at 15% opacity. Never use a 100% opaque border.
*   **Glassmorphism:** Apply a subtle `outline` (#6d758c) at 10% opacity to the top and left edges of glass cards to simulate a light-catching "beveled edge."

## 5. Components

### Buttons
*   **Primary:** Gradient (`primary` to `primary-dim`), `xl` (1.5rem) roundedness. No border.
*   **Secondary:** Ghost style. `outline` at 20% opacity. Text in `primary`.
*   **Tertiary:** Text-only, using `label-md` in `on-surface-variant`.

### Chips & Filters
*   **Filter Chips:** `surface-container-highest` background, `md` (0.75rem) roundedness. Active state uses `primary-container` with `on-primary-container` text.

### Input Fields
*   **Text Inputs:** Background `surface-container-low`. No bottom line. Use a `sm` (0.25rem) rounded corner. Focus state uses a `primary` glow (2px spread, 20% opacity) rather than a hard border.

### Progress & Analytics Bars
*   **Fit Indicator:** Use a multi-stop gradient (e.g., `error` to `secondary`) to visualize the spectrum of fit. Avoid segmented bars; keep them smooth and continuous.

### Cards & Lists
*   **Rule:** Forbid divider lines.
*   **Implementation:** Use 16px of vertical white space and a subtle background shift on hover (`surface-bright` at 5% opacity) to distinguish list items.

## 6. Do's and Don'ts

### Do:
*   **Do** use `secondary` (#3fff8b) sparingly as a "laser pointer" to highlight perfect fit matches.
*   **Do** use asymmetrical layouts (e.g., a large 70% width chart next to a 30% width glass card).
*   **Do** ensure text on `primary` surfaces uses `on-primary` (#39008c) for maximum contrast.

### Don't:
*   **Don't** use pure white (#FFFFFF). Always use `on-surface` (#dee5ff) to prevent eye strain in dark mode.
*   **Don't** use "Drop Shadows" that are black and tight. It breaks the glass aesthetic.
*   **Don't** use sharp 90-degree corners. Stick to the `DEFAULT` (0.5rem) or `lg` (1rem) tokens to maintain the premium, organic feel.
*   **Don't** clutter the UI with icons. Let the high-contrast typography and color-coded metrics do the talking.