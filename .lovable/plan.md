

# CodePilot — DSA Algorithm Visualizer & Playground

## Page 1: Home / Landing Page
- **Hero Section** — Bold "Master DSA, Visually" tagline with animated code graphics and a small live sorting animation embedded as an attention grabber. Two CTA buttons: "Open Playground" and "Explore Visualizer" (coming soon)
- **Feature Showcase** — Three animated glassmorphism cards highlighting Playground, Visualizer (coming soon), and Progress Tracking capabilities with hover effects
- **Stats Section** — Animated counters ("6 Data Structures", "15+ Operations") with fade-in on scroll
- **Navigation Bar** — Sticky top nav with links to Home, Playground, and a small progress indicator showing overall exploration %

## Page 2: DSA Playground
- **Data Structure Selector** — Six visually distinct cards/tabs: Array, Linked List, Stack, Queue, BST, Graph
- **Operations Panel** — Context-aware buttons that change per structure (Insert/Delete/Search for Array, Push/Pop for Stack, Enqueue/Dequeue for Queue, etc.)
- **Input Area** — Manual input fields plus a "Generate Random" button for quick setup
- **Live Visualization Canvas** — Full step-by-step animated rendering using SVG for node-based structures (Linked List, BST, Graph) with circles, arrows, and animated transitions, and styled HTML elements for linear structures (Array, Stack, Queue) with color-coded highlights and smooth state transitions. Includes speed control slider.
- **Output Log** — Scrollable panel showing timestamped operation results and step-by-step descriptions
- **Progress Tracking** — Saved to localStorage; each data structure shows a small progress bar indicating which operations the user has explored, visible both in the Playground sidebar and the nav bar

## Design & UX
- Light theme with glassmorphism accents (frosted glass cards, subtle shadows)
- Smooth scroll animations and fade-in transitions throughout
- Professional, polished typography and spacing
- Responsive layout for desktop and tablet

## Tech Approach
- Frontend only — no backend needed
- localStorage for persisting user progress
- SVG-based animations for data structure visualizations
- All data within the app (no external APIs)

