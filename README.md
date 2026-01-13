# MediBridge (Next.js Frontend)

Live: https://medibridge.uz

MediBridge is a production‑style healthcare platform frontend that connects patients, doctors, and clinics in one place. It focuses on fast access to care, clear booking flows, and a modern patient experience.

## Highlights
- Patient‑first booking flow with real‑time availability
- Dedicated doctor and clinic directories
- Articles/blog experience for health education
- Real‑time chat and notifications
- Product marketplace and order tracking
- Role‑aware “My Page” dashboards

## Tech Stack
- **Framework**: Next.js (Pages Router) + React 19 + TypeScript
- **Data**: Apollo Client (GraphQL + subscriptions)
- **UI**: MUI, Sass, Bootstrap, Swiper
- **Realtime**: GraphQL WS + Socket.IO
- **Auth & Security**: JWT, social login (Google, Kakao, Telegram)
- **Content**: Toast UI Editor, DOMPurify

## Core Features
- **Appointments**: book, reschedule, and manage visit slots
- **Slot Holding**: temporary holds prevent double-booking during checkout
- **Doctors & Clinics**: browse, filter, and view profiles
- **Articles**: blog listing, details, comments, likes
- **Chat**: real‑time conversations and presence
- **AI Chatbot**: guided help and quick medical assistance
- **Marketplace**: products, favorites, orders, and history
- **Profiles**: editable personal info, avatar upload/crop
- **Email**: notifications and email subscriptions
- **Internationalization**: i18next support

## Strong Points
- **Real‑world UX**: practical workflows and dashboards for multiple roles
- **Scalable data layer**: GraphQL caching + upload support
- **Consistent design system**: MUI + Sass with shared tokens
- **Realtime readiness**: WebSocket and Socket.IO integrations

## Project Structure
```
/ (root)
├─ apollo/            # Apollo client setup
├─ libs/              # App modules, components, helpers
├─ pages/             # Next.js pages/routes
├─ styles/            # Sass styles and theme
└─ public/            # Static assets
```

## Environment Variables
Create a `.env.local` and provide the following as needed:

```
# GraphQL endpoints
NEXT_PUBLIC_API_GRAPHQL_URL=...   # Browser GraphQL endpoint
NEXT_PUBLIC_API_WS=...            # GraphQL WS endpoint (subscriptions)
API_INTERNAL_GRAPHQL_URL=...      # Server‑side GraphQL endpoint

# REST/media base URL fallback
REACT_APP_API_URL=...
NEXT_PUBLIC_API_URL=...

# Social auth (optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
NEXT_PUBLIC_KAKAO_JS_KEY=...
NEXT_PUBLIC_TELEGRAM_BOT_NAME=...

# Optional realtime socket
NEXT_PUBLIC_API_SOCKET=...
```

See `docker-compose.yml` for an example local setup.

## Getting Started
```bash
yarn install
yarn run dev
```

The app runs at `http://localhost:3000` by default.

## Scripts
- `yarn run dev` — local development (Turbopack)
- `yarn run build` — production build
- `yarn run start` — production server

## Deployment
This app is ready for Vercel or any Node host. Make sure all required environment variables are set before build.

## Architecture Diagram
```
Browser
  |
  v
Next.js (Pages Router)
  |            \
  |             \-- Static Assets (public/)
  v
Apollo Client (GraphQL HTTP/WS)
  |
  v
MediBridge API (GraphQL + REST media)
  |
  v
Services (auth, scheduling, content, chat)
```

---
