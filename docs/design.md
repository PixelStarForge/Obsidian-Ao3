<!-- markdownlint-disable MD033 MD012 MD024 -->

# Obsidian AO3: Design System & Specifications

This document outlines the core visual identity, color palette, typographic hierarchy, and accessibility standards for the **Obsidian AO3** web extension.

## 1. Core Color Palette

The Obsidian theme relies on deep, volcanic blacks and cool charcoal greys to reduce eye strain, paired with vibrant, high-contrast pastel-neon accents for interactivity and semantic meaning.

### Backgrounds & Surfaces

| Role | Hex Code & Preview | Usage |
| :--- | :--- | :--- |
| **Base Background** | <span style="display:inline-block; width:14px; height:14px; background:#0A0A0B; border:1px solid #71717A; border-radius:3px; vertical-align:middle;"></span> `#0A0A0B` | `body`, main reading area background. |
| **Surface Level 1** | <span style="display:inline-block; width:14px; height:14px; background:#161618; border:1px solid #71717A; border-radius:3px; vertical-align:middle;"></span> `#161618` | Work blurbs (`.work.blurb`), header, footer. |
| **Surface Level 2** | <span style="display:inline-block; width:14px; height:14px; background:#222225; border:1px solid #71717A; border-radius:3px; vertical-align:middle;"></span> `#222225` | Comment blocks, blockquotes, inner cards. |
| **Borders & Dividers** | <span style="display:inline-block; width:14px; height:14px; background:#27272A; border:1px solid #71717A; border-radius:3px; vertical-align:middle;"></span> `#27272A` | Tag dividers, chapter separation lines (`hr`). |

### Typography & Contrast

| Role | Hex Code & Preview | Contrast on Base | Usage |
| :--- | :--- | :--- | :--- |
| **Primary Text** | <span style="display:inline-block; width:14px; height:14px; background:#E4E4E7; border:1px solid #71717A; border-radius:3px; vertical-align:middle;"></span> `#E4E4E7` | **15.2:1** (AAA) | Main fanfic text, headings, author names. |
| **Secondary Text** | <span style="display:inline-block; width:14px; height:14px; background:#A1A1AA; border:1px solid #71717A; border-radius:3px; vertical-align:middle;"></span> `#A1A1AA` | **7.4:1** (AAA) | Summaries, stats, timestamps, meta text. |
| **Disabled/Muted** | <span style="display:inline-block; width:14px; height:14px; background:#71717A; border:1px solid #71717A; border-radius:3px; vertical-align:middle;"></span> `#71717A` | 4.3:1 | Unavailable options, placeholder text. |

### Semantic Accent Palette (Balanced Luminance)

This palette maintains a uniform, high-contrast pastel aesthetic optimized for maximum readability (WCAG AAA compliant where possible) against the `#0A0A0B` base background.

| Color Name | Hex Code & Text Preview | Contrast Ratio | Intended AO3 Usage |
| :--- | :--- | :--- | :--- |
| **Amethyst (Primary)** | <span style="color:#E2A6FF; font-weight:bold;">#E2A6FF</span> | 7.8:1 | Main links, active states, primary buttons. |
| **Coral (Warnings)** | <span style="color:#FFA6A6; font-weight:bold;">#FFA6A6</span> | 7.3:1 | Archive Warnings, error states, delete actions. |
| **Sky Blue (Rels)** | <span style="color:#A6D2FF; font-weight:bold;">#A6D2FF</span> | 7.7:1 | Relationship tags, informational alerts. |
| **Mint (Characters)** | <span style="color:#A6FFD2; font-weight:bold;">#A6FFD2</span> | 9.5:1 | Character tags, success states (Kudos). |
| **Gold (Additional)** | <span style="color:#FFF0A6; font-weight:bold;">#FFF0A6</span> | 9.3:1 | Additional tags, warning/caution alerts. |
| **Peach (Orange)** | <span style="color:#FFCCA6; font-weight:bold;">#FFCCA6</span> | 8.1:1 | Pending status, secondary warnings. |
| **Lime (Yellow-Green)** | <span style="color:#D2FFA6; font-weight:bold;">#D2FFA6</span> | 9.4:1 | Alternative success, new chapter indicators. |
| **Aqua (Cyan)** | <span style="color:#A6FFFF; font-weight:bold;">#A6FFFF</span> | 9.0:1 | Special categories, external links. |
| **Rose (Pink)** | <span style="color:#FFA6D2; font-weight:bold;">#FFA6D2</span> | 7.5:1 | Pinned items, bookmarks, user highlights. |

---

## 2. Typographic Hierarchy & Visual Scale

**Base Font Family:** `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`

<div style="background-color: #0A0A0B; padding: 20px; border-radius: 8px; border: 1px solid #27272A; color: #E4E4E7; font-family: system-ui, sans-serif;">
  <div style="font-size: 1.875rem; font-weight: 700; line-height: 1.2; margin-bottom: 0.5rem;">H1 (Fic Title) - 30px</div>
  <div style="font-size: 1.5rem; font-weight: 600; line-height: 1.3; margin-bottom: 1rem;">H2 (Chapter Title) - 24px</div>
  <div style="font-size: 1.25rem; font-weight: 500; line-height: 1.4; margin-bottom: 0.5rem; color: #A1A1AA;">H3 (Author Name) - 20px</div>
  <div style="font-size: 1.125rem; font-weight: 400; line-height: 1.7; margin-bottom: 1.5rem; max-width: 70ch;">
    <strong>Body (Fic Text) - 18px:</strong> This demonstrates the standard body text used for the actual story content. It uses a line-height of 1.7 to ensure maximum readability during long reading sessions, keeping the text from feeling too cramped. The maximum width is constrained to prevent eye fatigue.
  </div>
  <div style="font-size: 0.875rem; font-weight: 400; line-height: 1.5; color: #A1A1AA;">Metadata/Stats - 14px • Published: 2026-07-12 • Words: 42,000</div>
</div>

---

## 3. UI Component Guidelines

### Buttons

<div style="background-color: #0A0A0B; padding: 20px; border-radius: 8px; border: 1px solid #27272A; display: flex; flex-direction: column; gap: 20px;">
  <div>
    <h4 style="color: #E4E4E7; margin-bottom: 10px; margin-top: 0;">Buttons</h4>
    <button style="background-color: #E2A6FF; color: #0A0A0B; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-size: 14px; font-weight: bold; cursor: pointer; margin-right: 10px;">Primary Button</button>
    <button style="background-color: #27272A; color: #E4E4E7; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-size: 14px; cursor: pointer;">Secondary Button</button>
  </div>
</div>


### Form Inputs


<div style="background-color: #0A0A0B; padding: 20px; border-radius: 8px; border: 1px solid #27272A;">
  <h4 style="color: #E4E4E7; margin-bottom: 10px; margin-top: 0;">Form Inputs</h4>
  <input type="text" placeholder="Search works..." style="background-color: #0A0A0B; border: 1px solid #27272A; color: #E4E4E7; padding: 0.5rem 1rem; border-radius: 4px; font-size: 14px; width: 250px; outline: none;">
  <p style="color: #A1A1AA; font-size: 12px; margin-top: 5px;">(Focus state adds <code>#E2A6FF</code> border and shadow)</p>
</div>


---

## 4. Spacing, Layout, & Readability


<div style="background-color: #161618; padding: 2rem; border: 1px solid #27272A; border-radius: 8px; color: #E4E4E7; max-width: 180ch; margin: 0 auto;">
  <h3 style="margin-top: 0;">Main Content Area Example</h3>
  <p style="margin-bottom: 1.5em; line-height: 1.7; letter-spacing: 0.01em;">
    This container illustrates the <code>2rem</code> padding on desktop and the <code>max-width: 180ch</code> constraint. The margin bottom of this specific paragraph is set to <code>1.5em</code> to create a visual break.
  </p>
  <blockquote style="margin: 0 0 1.5em 0; padding: 1rem 1.5rem; border-left: 4px solid #E2A6FF; background-color: #222225;">
    This is a blockquote element, commonly used for author notes or summary excerpts. It utilizes a left-border for distinction without needing extra left margin.
  </blockquote>
  <p style="margin-bottom: 0; line-height: 1.7; letter-spacing: 0.01em;">
    Notice how the text never touches the edges, reducing claustrophobia in the design.
  </p>
</div>


---

## 5. Interaction & Motion

All interactive elements must use consistent CSS transitions to feel responsive but not sluggish.

| Interaction Type | Property | Duration | Easing Function | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Hover States** | `background-color`, `color` | `0.15s` | `ease-in-out` | Buttons, links, tag pills. |
| **Focus Rings** | `box-shadow`, `outline` | `0.1s` | `ease-out` | Keyboard navigation (`:focus`). |
| **Modals/Menus** | `opacity`, `transform` | `0.2s` | `cubic-bezier(0.4, 0, 0.2, 1)` | Dropdowns, filter sidebars. |

### Example CSS

```css
.button, a, .tag {
  transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out;
}

.button:hover {
  background-color: #E2A6FF;
  color: #0A0A0B;
}

:focus {
  box-shadow: 0 0 0 3px #E2A6FF;
  outline: none;
}
```

---

## 6. Iconography & SVG Handling

AO3 uses several icons (locks for restricted works, checkmarks for completed works, kudos hearts). These need explicit dark-mode rules so they don't remain black and invisible.

### Standard Icons

- **Bookmarks, Comments:** `fill: #A1A1AA` (Secondary Text)
- **Active/Action Icons (Kudos Heart):** `fill: #FFA6A6` (Coral/Red)
- **Restricted Work Icon (Lock):** `fill: #FFA6A6` (Coral/Red)
- **Completed Work Icon (Check):** `fill: #A6FFD2` (Mint)

### Example CSS (Targeting inline SVGs)

```css
.icon svg {
  fill: currentColor; /* Inherits from parent text color */
}

.icon.bookmark svg {
  fill: #A1A1AA;
}

.icon.kudos svg {
  fill: #FFA6A6;
}

.icon.restricted svg {
  fill: #FFA6A6;
}

.icon.completed svg {
  fill: #A6FFD2;
}
```

---

## 7. Responsive Breakpoints

The layout adjusts to prioritize the reading experience on smaller screens by reducing padding and hiding non-essential sidebar elements.

| Breakpoint | Max Width | Adjustments |
| :--- | :--- | :--- |
| **Mobile (Small)** | 480px | Container padding reduces to 1rem. Font size remains 18px. |
| **Mobile (Large)** | 768px | Filter sidebar collapses into a modal/dropdown. |
| **Tablet** | 1024px | Work blurbs span full width; multi-column footers stack. |

### Example CSS

```css
@media (max-width: 480px) {
  body {
    padding: 1rem;
  }
  
  .container {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .filter-sidebar {
    display: none;
  }
  
  .filter-toggle {
    display: block;
  }
}

@media (max-width: 1024px) {
  .work-blurb {
    width: 100%;
  }
  
  .footer {
    display: flex;
    flex-direction: column;
  }
}
```
