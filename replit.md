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
**Phase 3 Complete**: Full-stack application with Apify Twitter integration
- ✅ PostgreSQL database with Drizzle ORM for persistent storage
- ✅ Historical snapshots table with automatic capture every 5 minutes
- ✅ Scheduled jobs for data updates, snapshots, and cleanup (30-day retention)
- ✅ WebSocket real-time updates working with database-backed data
- ✅ All API endpoints functional with live data
- ✅ City filtering logic implemented (only shows trends with matching accounts)
- ✅ Apify Twitter Scraper integration (cost-effective alternative to Twitter API)
- ✅ Automatic fetching of real Saudi trends every 60 seconds (when API token provided)
- ✅ Manual sync endpoint for on-demand data refresh
- ✅ Fallback to simulated data when API unavailable

## Recent Changes (November 8, 2025)
### Twitter/X API Integration via Apify (Task 7 - Completed)
- ✅ Integrated Apify Twitter Trends Scraper (cost: ~$0.01 per 1000 results)
- ✅ Created TwitterService class with fetchTrendingTopics()
- ✅ Added POST /api/sync/twitter endpoint for manual data synchronization
- ✅ Auto-fetch real trends every 60 seconds if APIFY_API_TOKEN is set
- ✅ **Trends: REAL** - Fetched live from Twitter via Apify
- ✅ **Accounts: SIMULATED** - Using generated test data (Apify account actor unavailable)
- ✅ Graceful fallback to simulated data when API unavailable
- ✅ Sentiment analysis and bot detection applied to real Twitter data
- ⚠️ Account fetching disabled - scrapers/twitter actor not found on Apify

### Export Functionality (Task 6 - Completed)
- ✅ Created 4 export endpoints: CSV/JSON for trends and accounts
- ✅ Implemented CSV conversion utilities with proper Arabic headers
- ✅ Added export dropdown button to dashboard header with icons
- ✅ Filter integration: trends export respects cities, excludeBots, timeRange, minEngagement
- ✅ Proper HTTP headers: Content-Type and Content-Disposition for file downloads
- ✅ Timestamp-based filenames (e.g., saudi-trends-trends-2025-11-08T12-00-52.csv)
- ✅ All tests passed - UI displays correctly, downloads work, filters applied

### Advanced Bot Detection (Task 5 - Completed)
- ✅ Added botScore (0-100) and accountAge fields to accounts schema
- ✅ Implemented multi-factor bot detection algorithm analyzing:
  - Follower patterns (very low/high = suspicious)
  - Account age (new accounts = higher risk)
  - Username patterns (digits, bot keywords)
  - Verification status (bonus for verified)
- ✅ Created bot-detector.ts with risk level categorization (low/medium/high/very high)
- ✅ Updated UI to display bot probability badges with color-coded risk levels
- ✅ Added tooltips showing risk level and account age in Arabic
- ✅ All tests passed - bot scores calculated correctly, UI displays properly, filtering works

### Arabic Sentiment Analysis (Task 4 - Completed)
- ✅ Implemented Arabic keyword-based sentiment analysis with positive/negative word dictionaries
- ✅ Added sentiment fields to trends schema (sentimentPositive, sentimentNegative, sentimentNeutral)
- ✅ Created sentiment-analyzer.ts with robust normalization ensuring values always sum to 100
- ✅ Updated frontend TrendCard with color-coded sentiment bars (green/gray/red) and Arabic tooltips
- ✅ Fixed sentiment normalization bugs in both initial seeding and real-time updates
- ✅ All tests passed - sentiment values maintained at exactly 100% through update cycles

### Previous Changes (November 7, 2025)
- Database Migration to PostgreSQL with Drizzle ORM
- Added snapshots table for historical trend tracking
- Implemented automatic database seeding on startup
- Created DbStorage class with full CRUD operations
- Scheduled jobs: updates (60s), snapshots (5min), cleanup (30 days)
- API enhancements: history endpoint, city filtering, optimized queries

## Project Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Shadcn UI + Tailwind CSS
- **State Management**: TanStack Query (React Query v5)
- **Routing**: Wouter
- **Backend**: Express.js + WebSocket (ws)
- **Database**: PostgreSQL with Drizzle ORM (DbStorage)
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
- `POST /api/sync/twitter` - Manually sync data from Apify Twitter Scraper
- `GET /api/export/trends/csv` - Export trends as CSV with Arabic headers
- `GET /api/export/trends/json` - Export trends as JSON
- `GET /api/export/accounts/csv` - Export accounts as CSV with Arabic headers
- `GET /api/export/accounts/json` - Export accounts as JSON
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

## Setup Instructions

### Required Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (automatically provided by Replit)
- `APIFY_API_TOKEN` - (Optional) Apify API token for real Twitter data
  - Get free account at https://apify.com
  - Cost: ~$0.01 per 1000 results
  - Without token: app uses simulated data

### Running the Application
```bash
npm run dev  # Starts both backend and frontend
```

### Manual Twitter Sync
```bash
curl -X POST http://localhost:5000/api/sync/twitter
```

## Technical Decisions

### Why Apify Instead of Twitter API?
- **Cost**: Twitter API Pro tier costs $5,000+/month, Apify costs ~$0.01 per 1000 results
- **Accessibility**: Twitter API requires expensive subscription, Apify works with free account
- **Reliability**: Apify scraper proven to work for Saudi trends
- **Flexibility**: Easy to switch to official API later if needed

### Bot Detection Algorithm
- Deterministic (no randomness) for consistent scoring
- Multi-factor analysis: followers, account age, username patterns, verification
- Risk levels: Low (0-24%), Medium (25-49%), High (50-74%), Very High (75-100%)

### Sentiment Analysis
- Arabic keyword-based with positive/negative word dictionaries
- Always sums to exactly 100% (robust normalization)
- Applied to both hashtags and tweet content
