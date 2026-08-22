# Design System Strategy: Tactical CRM (Aggressive Tech Dark Mode)

## 1. Visual Identity & Vibe
- **Aesthetic**: Aggressive, highly technical, high-performance tactical dark mode.
- **Atmosphere**: No friendly or soft rounded corners. Layouts must feel like a high-density command center panel built for rapid data filtering.

## 2. Core Color Palette Tokens (shadcn/ui CSS Variables)
Apply these values directly inside your global CSS file (`app/globals.css` or `src/index.css`) under the `.dark` class block.

```css
@layer base {
  :root {
    /* Default fallback to light variables if needed, but optimized for Dark Mode */
  }

  .dark {
    --background: 220 22% 5%;       /* #0B0C10 */
    --foreground: 0 0% 100%;        /* #FFFFFF */
    
    --card: 214 24% 16%;            /* #121212 */
    --card-foreground: 0 0% 100%;   /* #FFFFFF */
    
    --popover: 215 24% 20%;         /* #1C1C1C */
    --popover-foreground: 0 0% 100%;/* #FFFFFF */
    
    --primary: 43 100% 50%;         /* #FFB800 (Tactical Amber Primary) */
    --primary-foreground: 220 22% 5%;/* #0B0C10 (Dark text on primary) */
    
    --secondary: 216 17% 21%;      /* #2D3540 */
    --secondary-foreground: 0 0% 100%;
    
    --muted: 216 17% 21%;           /* #2D3540 */
    --muted-foreground: 211 6% 63%; /* #9AA0A6 */
    
    --accent: 215 19% 28%;          /* #3A4552 */
    --accent-foreground: 104 100% 54%;
    
    --destructive: 348 100% 58%;    /* #FF2A54 */
    --destructive-foreground: 0 0% 100%;
    
    --border: 215 19% 28%;          /* #3A4552 */
    --input: 215 19% 28%;           /* #3A4552 */
    --ring: 104 100% 54%;           /* #FFB800 */
    
    --radius: 0rem;                 /* Sharp industrial edges */
  }
}
```

## 3. UI Component Constraints & System Architecture
- **Borders & Radius**: Enforce `radius: 0rem` across all shadcn primitives (`Button`, `Card`, `Dialog`, etc.). No rounded corners allowed.
- **Typography**: Inject monospaced font stacks (`font-mono` via `JetBrains Mono` or `Fira Code`) into all numerical metrics, pipeline pipeline amounts, and database rows. Use a clean sans-serif (`Inter`) for tooltips and functional labels only.
- **Interactions**: Remove soft transitions. State updates (hover, active, focus) must trigger instantly (`transition-none`) to simulate an instant tactical system execution.

## 4. Specific CRM Component Layout Instructions
- **Kanban Pipeline**: Columns use standard shadcn `<Card />` layouts but must feature a 2px vertical neon highlight boundary (`border-l-2 border-l-primary`) at the left edge of headers.
- **Data Tables**: High data density using shadcn `<Table />`. Alternate row background fills using utility class `odd:bg-[#0E0E0E] even:bg-[#121212]`. Active selection or hover must trigger an explicit neon border outline (`outline outline-1 outline-primary`).
