# Saudi Arabia Trending Topics Analyzer

## Overview
A real-time web application that analyzes trending topics in Saudi Arabia, displaying popular hashtags, top accounts, engagement metrics, and geographic distribution across Saudi cities.

## Purpose
Track and analyze Saudi Arabian social media trends in real-time with:
- Live trending hashtags and topics
- Top participating accounts
- Engagement metrics (retweets, likes, comments)
- Geographic distribution across Saudi cities
- Admin filters for cities, bot detection, and time range

## Current State
**Phase 2 Complete**: Full-stack application with PostgreSQL persistence
- ✅ PostgreSQL database with Drizzle ORM for persistent storage
- ✅ Historical snapshots table with automatic capture every 5 minutes
- ✅ Scheduled jobs for data updates, snapshots, and cleanup (30-day retention)
- ✅ WebSocket real-time updates working with database-backed data
- ✅ All API endpoints functional with live data
- ✅ City filtering logic implemented (only shows trends with matching accounts)
- ⏳ Twitter/X API integration pending (requires API credentials)

## Recent Changes (November 7, 2025)
### Database Migration
- Migrated from in-memory storage to PostgreSQL with Drizzle ORM
- Added snapshots table for historical trend tracking
- Implemented automatic database seeding on startup (12 trends, 83 accounts)
- Created DbStorage class with full CRUD operations

### Scheduled Jobs
- Trend updates broadcast via WebSocket every 60 seconds
- Snapshot capture every 5 minutes for time-series analytics
- Automatic cleanup of snapshots older than 30 days

### API Enhancements
- Added `/api/trends/:id/history` endpoint for historical data
- Fixed city filtering to prevent empty trend cards
- Optimized query structure with array-based query keys for cache invalidation

## Project Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Shadcn UI + Tailwind CSS
- **State Management**: TanStack Query (React Query v5)
- **Routing**: Wouter
- **Backend**: Express.js + WebSocket (ws)
- **Storage**: In-memory storage (MemStorage)
- **Real-time**: WebSocket for live updates every minute

### Directory Structure
```
client/
  src/
    components/       # Reusable UI components
    pages/           # Page components (Dashboard)
    lib/             # Utilities and query client
server/
  routes.ts         # API endpoints and WebSocket server
  storage.ts        # In-memory data storage
shared/
  schema.ts         # Shared data models and types
```

### Data Models
1. **Trends**: hashtag, rank, tweetCount, velocity, engagement metrics
2. **Accounts**: username, avatar, verified status, location, followers
3. **Posts**: content, engagement metrics, timestamps
4. **Filters**: cities, excludeBots, timeRange, minEngagement
5. **Saudi Cities**: 16 major cities with coordinates and regions

### Design System
- **Primary Color**: Saudi Green (HSL: 152 65% 32%)
- **Typography**: IBM Plex Sans Arabic (primary), Inter (numbers), JetBrains Mono (code)
- **Layout**: RTL-first with responsive grid (mobile → tablet → desktop)
- **Components**: Shadcn UI with custom Saudi theme
- **Spacing**: Tailwind units (2, 4, 6, 8, 12, 16)

### Key Features Implemented
1. ✅ Real-time dashboard with auto-refresh
2. ✅ Trending topics grid (3-column desktop, responsive)
3. ✅ Top accounts with verification badges
4. ✅ Stats overview cards (4 metrics)
5. ✅ Geographic distribution map (Saudi cities)
6. ✅ Filter sidebar (cities, bot detection, time range)
7. ✅ Live status indicator with WebSocket connection
8. ✅ Dark mode with theme toggle
9. ✅ Loading skeletons and error states
10. ✅ Arabic RTL support throughout

### API Endpoints
- `GET /api/trends` - Fetch trending topics with filters (cities, excludeBots, timeRange, minEngagement)
- `GET /api/trends/:id` - Get single trend by ID
- `GET /api/trends/:id/history` - Get historical snapshots (query param: hours)
- `GET /api/accounts/top` - Fetch top 20 participating accounts by followers
- `GET /api/accounts` - Get accounts by trend (query param: trendId)
- `WebSocket /ws` - Real-time updates every 60 seconds

### WebSocket Messages
- `trends_update`: Broadcast updated trends data
- `new_trend`: Notify when new trend enters the list
- `connected`: Initial connection confirmation

## User Preferences
- Language: Arabic (primary), English (secondary for hashtags/numbers)
- Direction: RTL (Right-to-Left)
- Theme: Light mode default with dark mode support
- Auto-refresh: Every 60 seconds

## Next Steps
1. Implement backend API endpoints with mock Saudi trend data
2. Set up WebSocket server for real-time updates
3. Connect frontend to backend APIs
4. Test complete user journey
5. Polish loading states and error handling
