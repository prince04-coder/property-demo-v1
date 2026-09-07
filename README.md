# Property Demo V1

A Next.js property management frontend for head office and subordinate users. The app supports role-based login, property/renter management, hierarchy views, and rent tracking workflows backed by the `property-demo-v1-backend` API.

## Tech Stack

- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS
- Radix UI + shadcn/ui components
- Recharts

## Features

- Role-based authentication and dashboard routing
- Head office dashboard and hierarchy management
- Subordinate dashboard and hierarchy view
- Tenant/renter management pages
- Property detail page with rent/history data
- Notification and settings integrations

## Project Structure

- `app/` — route pages and layouts
- `components/` — reusable UI and layout components
- `hooks/` — shared React hooks
- `lib/` — utility helpers
- `public/` — static assets
- `styles/` — global styles

## Getting Started

### Prerequisites

- Node.js 18+ (recommended)
- npm

### Installation

```bash
npm install
```

### Run in development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for production

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

## Authentication and API

- Root route (`/`) redirects to `/login`.
- Login uses the backend auth endpoint and routes users based on role.
- Most pages consume endpoints from:
  - `https://property-demo-v1-backend.onrender.com/api/...`

## Notes

- This repository contains only the frontend application.
- Ensure the backend service is reachable for login and data-driven pages.
