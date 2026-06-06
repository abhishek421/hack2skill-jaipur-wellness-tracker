# MindTrack Design System (Airy Cloud Glassmorphism)

## 1. Concept & Vibe
Based on the latest feedback, we are adopting an **"Airy Cloud Glassmorphism"** aesthetic. 

This design uses soft sky blue and white tones to create a light, breathable, and floating feeling—perfect for a mental wellness app. The UI relies on progressive blur (glassmorphism) over soft gradients to feel incredibly modern, calm, and approachable.

## 2. Color Palette
The palette is entirely restricted to sky blues, cyans, and clean whites.

*   **Background:** Soft, airy gradient from very light sky blue (`#E0F2FE`) to pure white (`#FFFFFF`).
*   **Surfaces/Cards:** Semi-transparent frosted white (`rgba(255, 255, 255, 0.7)`) with a white inner border (`border border-white/50`).
*   **Text Primary:** Deep slate blue (`#0F172A`) for high contrast and readability.
*   **Text Secondary:** Muted blue-gray (`#64748B`).
*   **Accents (Charts, Sliders, Highlights):** 
    *   Primary Blue: `#3B82F6`
    *   Soft Cyan: `#06B6D4`
    *   Light Sky: `#BAE6FD`

## 3. UI Patterns & Primitives

### Containers & Cards
*   **Background:** Frosted glass effect using Tailwind's `bg-white/70 backdrop-blur-xl`.
*   **Borders:** Clean, thin white borders to create edge highlights (`border border-white/60`).
*   **Corners:** Smoothly rounded (`rounded-2xl` or `rounded-3xl`).
*   **Shadows:** Soft, progressive blue drop shadows to give a floating effect (`shadow-[0_8px_30px_rgb(59,130,246,0.1)]`).

### Buttons & Interactivity
*   **Primary Action:** Solid sky blue (`bg-blue-500`) with white text and a soft blue glow (`shadow-lg shadow-blue-500/30`).
*   **Secondary/Tags:** Semi-transparent white (`bg-white/50`) with blue text.
*   **Icons:** **Keep emojis for the mood icons** to maintain a friendly, approachable, and playful interaction layer against the sleek glass UI.

### Typography
*   **Font Family:** Clean, modern, crisp sans-serif (e.g., Inter, SF Pro).
*   **Hierarchy:** Dark slate blue for main headings to provide grounding against the airy background.

## 4. Specific Screen Redesigns

### Dashboard (`/dashboard`)
*   **Background:** Full viewport soft sky-blue to white gradient.
*   **Stat Cards:** Glassmorphic cards. Use emojis for the mood status.
*   **Charts:** Soft cyan and blue lines (`#3B82F6` and `#06B6D4`) with a soft gradient fill below the lines (`fill="url(#colorUv)"`). Remove harsh grids; use faint white or very light blue grid lines.

### Check-in Wizard (`/checkin`)
*   **Mood Selection:** Grid of frosted glass tiles. The tiles feature familiar **emojis** for the mood faces. When selected, the glass tile gets a solid blue border and a deeper white fill.
*   **Sliders:** A sleek blue track with a distinct, glowing thumb.
*   **Triggers:** Pill-shaped tags using the semi-transparent white style.
*   **Journal (`textarea`):** A frosted glass input field.

### Weekly Summary (`/weekly-summary`)
*   **Narrative Card:** A standout glass pane that looks like a floating summary.
*   **Radar Chart:** Elegant blue lines over the glass pane.
