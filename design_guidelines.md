# Design Guidelines: Saudi Arabia Trending Topics Analyzer

## Design Approach
**System-Based Approach** inspired by **Material Design** and modern analytics platforms (Linear, Vercel Analytics). This data-intensive dashboard requires clarity, information hierarchy, and real-time data presentation with strong RTL (Right-to-Left) Arabic support.

## Core Design Principles
1. **Data First**: Prioritize information visibility and scanability
2. **Real-time Clarity**: Visual indicators for live updates and data freshness
3. **Arabic-Centric**: RTL layout with Arabic typography as primary
4. **Geographic Context**: Map-driven insights with regional emphasis

---

## Typography System

### Font Families
- **Arabic Primary**: 'IBM Plex Sans Arabic' (Google Fonts) - for UI and content
- **Latin Secondary**: 'Inter' (Google Fonts) - for numbers and Latin text
- **Monospace**: 'JetBrains Mono' - for timestamps and metrics

### Type Scale (Tailwind)
- Hero/Dashboard Title: `text-4xl md:text-5xl font-bold`
- Section Headers: `text-2xl md:text-3xl font-semibold`
- Card Titles: `text-xl font-semibold`
- Trending Hashtags: `text-lg font-bold`
- Body Text: `text-base font-normal`
- Metrics/Stats: `text-sm md:text-base font-medium`
- Timestamps/Meta: `text-xs md:text-sm font-normal`

---

## Layout System

### Spacing Primitives
Use Tailwind units: **2, 4, 6, 8, 12, 16** for consistent rhythm
- Card padding: `p-6`
- Section spacing: `py-12 md:py-16`
- Component gaps: `gap-4` or `gap-6`
- Dashboard grid gaps: `gap-6`

### Grid Structure
**Dashboard Layout** (Desktop):
```
┌─────────────────────────────────────┐
│  Header (Logo + Live Status + User) │
├─────────────┬───────────────────────┤
│   Sidebar   │   Main Dashboard      │
│   Filters   │   - Top Trends Grid   │
│   (280px)   │   - Stats Cards       │
│             │   - Map View          │
│             │   - Trend Details     │
└─────────────┴───────────────────────┘
```

**Responsive Breakpoints**:
- Mobile: Stacked layout, collapsible sidebar as drawer
- Tablet (md): 2-column trend cards
- Desktop (lg): 3-column trend cards, fixed sidebar

### Container Widths
- Full dashboard: `w-full`
- Content max-width: `max-w-7xl mx-auto`
- Sidebar: `w-70` (280px) fixed on desktop

---

## Component Library

### 1. Navigation & Header
**Top Bar** (fixed, full-width):
- Logo (right-aligned for RTL)
- Live status indicator with pulse animation "مباشر الآن" + timestamp
- User menu (left-aligned for RTL)
- Height: `h-16`

**Sidebar Panel** (Admin Filters):
- Filter sections with accordion pattern
- City checkboxes with nested districts
- Time range slider
- Bot detection toggle
- Apply/Reset buttons stack
- Sticky positioning on desktop

### 2. Dashboard Cards

**Trend Card** (3-column grid on desktop):
- Hashtag badge with trending icon
- Rank number (large, prominent)
- Tweet count + velocity indicator (↑↓)
- Engagement metrics row (retweets, likes, comments)
- "View Details" link
- Border treatment with subtle elevation
- Compact: `min-h-[200px]`

**Stats Overview Cards** (4-column grid):
- Large metric number: `text-3xl md:text-4xl font-bold`
- Metric label below
- Trend indicator (percentage change)
- Icon representation (Heroicons)
- Card size: `aspect-square` or `min-h-[140px]`

**Top Accounts Card**:
- Profile image (circular, 48px)
- Account name + verification badge
- Handle as secondary text
- Engagement stats in compact pill format
- Follow/view profile actions
- List item height: `h-20`

### 3. Map Visualization

**Geographic Distribution Panel**:
- Full-width section below trends
- Saudi Arabia map (SVG) with interactive regions
- Hover states showing city-level data
- Legend showing density scale
- Height: `h-96 md:h-[500px]`

### 4. Data Tables

**Trend Details Table**:
- Sortable columns (timestamp, engagement, location)
- Row hover states
- Pagination controls
- Infinite scroll for real-time updates
- Compact row height: `h-14`

### 5. Real-time Elements

**Live Update Indicator**:
- Pulse animation dot
- "Last updated: X seconds ago" text
- Positioned in header, always visible
- Auto-refresh countdown timer

**Data Refresh Toast**:
- Bottom-right notification
- "Updated with X new trends"
- Dismiss after 3 seconds
- Slide-in animation

---

## Interaction Patterns

### Auto-Refresh Behavior
- Smooth fade transition for updated data
- Skeleton loaders during fetch
- No jarring full-page reloads

### Filtering
- Real-time filter application (no "submit" needed)
- Loading states on affected sections only
- Filter count badges

### Map Interactions
- Click region to filter dashboard
- Tooltip on hover with quick stats
- Zoom controls (mobile)

---

## Arabic RTL Implementation

### Critical RTL Patterns
- Text alignment: `text-right` default
- Flex/Grid direction: `flex-row-reverse`
- Padding/Margin: Mirror spacing (pr/pl swap)
- Icons: Flip directional icons (arrows, chevrons)
- Numbers: Keep LTR even in RTL context

### Mixed Content Handling
- Hashtags stay LTR: `dir="ltr"` on hashtag elements
- Dates/times in Arabic format but numeric LTR
- Metrics always LTR with Arabic labels

---

## Accessibility

- ARIA labels for all interactive elements in Arabic
- Keyboard navigation for filters and table sorting
- Screen reader announcements for live updates
- Focus indicators on all interactive elements
- Minimum touch target: 44x44px on mobile

---

## Images

**No hero images required** - this is a data dashboard application. Visual elements are:
- Map visualization (SVG)
- Profile images for accounts (circular thumbnails)
- Icon library: **Heroicons** for UI elements

---

## Animation Guidelines

**Minimal, purposeful animations only**:
- Live indicator pulse (continuous subtle)
- Card entrance stagger (100ms delay between items)
- Smooth fade for data updates (200ms)
- Map region highlight on hover
- NO scroll animations, parallax, or decorative motion