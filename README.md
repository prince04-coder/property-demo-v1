# Property Management Dashboard

A production-grade React SPA for managing government properties, subordinate managers, rent collection, and tenant administration. Built for the DC Office, Hamirpur, Himachal Pradesh.

## 🏗 Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | React 19 | Industry-standard UI library, component-based architecture |
| **Build Tool** | Vite 6 | Blazing-fast HMR, optimized Rollup builds, officially recommended by React team |
| **Routing** | React Router v6 | Industry-standard client-side routing with nested layouts and code splitting |
| **Styling** | Tailwind CSS 3 | Utility-first CSS with design tokens, dark mode via class strategy |
| **UI Components** | shadcn/ui + Radix UI | Accessible, unstyled primitives with composable Tailwind styling |
| **Charts** | Recharts | Declarative React charting library for financial dashboards |
| **Forms** | React Hook Form + Zod | Performant form management with schema validation |
| **State Management** | React Context API | Lightweight global state for auth and theme (no over-engineering) |
| **HTTP Client** | Native Fetch (centralized) | Zero-dependency API service layer with auto-auth headers |
| **Icons** | Lucide React | Consistent, tree-shakeable icon library |
| **Document Head** | react-helmet-async | Per-page title/meta management for SPA |
| **Linting** | ESLint 9 + Prettier | Code quality enforcement with React-specific rules |

## 📁 Project Structure

```
frontend/
├── public/                     # Static assets (served as-is by Vite)
├── src/
│   ├── main.jsx                # App entry point (ReactDOM + Providers)
│   ├── App.jsx                 # Route definitions with lazy loading
│   ├── index.css               # Global Tailwind styles + CSS variables
│   │
│   ├── components/             # Shared reusable components
│   │   ├── ui/                 # 50+ shadcn/ui primitives (Button, Card, Dialog, etc.)
│   │   ├── DashboardLayout.jsx # Main layout shell with sidebar + header
│   │   ├── ProtectedRoute.jsx  # Auth guard with role-based access control
│   │   └── PageLoader.jsx      # Suspense fallback loading indicator
│   │
│   ├── features/               # Feature-based modules (domain-organized)
│   │   ├── auth/               # Login page
│   │   ├── dashboard/          # Head Office analytics dashboard
│   │   ├── properties/         # Property management + detail pages
│   │   ├── subordinates/       # Manager CRUD + subordinate dashboards
│   │   └── tenants/            # Renter management pages
│   │
│   ├── context/                # React Contexts
│   │   ├── AuthContext.jsx     # Auth state (user, token, login, logout)
│   │   └── ThemeContext.jsx    # Theme state (light/dark/system)
│   │
│   ├── services/               # Centralized API service layer
│   │   ├── api.js              # Base HTTP client with auth injection
│   │   ├── authService.js      # Authentication endpoints
│   │   ├── userService.js      # User/hierarchy endpoints
│   │   ├── propertyService.js  # Property CRUD endpoints
│   │   ├── settingsService.js  # Global adjustment endpoints
│   │   └── notificationService.js
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useMobile.js        # Viewport mobile detection
│   │   └── useToast.js         # Toast notification manager
│   │
│   ├── utils/                  # Utility functions
│   │   ├── cn.js               # Tailwind class merger (clsx + tailwind-merge)
│   │   ├── formatters.js       # Currency and date formatting
│   │   └── exportCsv.js        # CSV file export utility
│   │
│   └── lib/
│       └── utils.js            # shadcn/ui compatibility re-export
│
├── vite.config.js              # Vite configuration with path aliases
├── tailwind.config.js          # Tailwind with custom design tokens
├── eslint.config.js            # ESLint flat config
├── jsconfig.json               # IDE path alias support
├── .env                        # Environment variables
└── package.json                # Dependencies and scripts
```

## 🏛 Architecture Decisions

### Why Feature-Based Folder Structure?
Files are organized by **domain feature** (auth, dashboard, properties, tenants, subordinates) rather than by file type (pages, components, hooks). This keeps related code co-located and makes the codebase navigable as it scales.

### Why Centralized API Service Layer?
Instead of scattered `fetch()` calls with hardcoded URLs in every component, all API communication flows through `services/api.js`. This provides:
- **Single source of truth** for the backend URL (via `VITE_API_BASE_URL`)
- **Automatic auth token injection** on every request
- **Centralized error handling** with structured error extraction
- **Testable, mockable** service functions

### Why React Context over Redux/Zustand?
The app has exactly two pieces of global state: **authentication** and **theme**. React Context handles this perfectly without the boilerplate of third-party state libraries. This is the right tool for this scale.

### Why Route-Level Code Splitting?
Every page component is loaded via `React.lazy()` + `Suspense`, so the initial bundle only includes the login page. Other routes are loaded on-demand. This reduces the initial JavaScript payload significantly.

### Why Custom ThemeContext Instead of next-themes?
`next-themes` is Next.js-specific. The custom `ThemeContext` replicates identical behavior (class-based dark mode toggle with system preference detection and localStorage persistence) in ~60 lines with zero dependencies.

### Why ProtectedRoute with RBAC?
Route protection is handled at the router level via a `ProtectedRoute` wrapper component that:
- Checks authentication from `AuthContext`
- Validates user role against `allowedRoles` prop
- Redirects unauthorized users to their appropriate dashboard
- Preserves the intended URL for post-login redirect

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root (or copy `.env.example`):

```
VITE_API_BASE_URL=https://property-demo-v1-backend.onrender.com
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server on port 3000 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint on `src/` |

## 🔐 Authentication Flow

1. User navigates to `/` → redirected to `/login`
2. Login with credentials → `POST /api/auth/login`
3. On success, JWT token and user data stored in `AuthContext` (persisted to localStorage)
4. Role-based redirect:
   - `headoffice` / `admin` → `/dashboard`
   - `subordinate` → `/subordinate-dashboard`
5. `ProtectedRoute` guards all dashboard routes, checking both auth and role

## 🎨 Theming

Supports **Light**, **Dark**, and **System** modes via Tailwind's `darkMode: 'class'` strategy. Theme preference is persisted to localStorage and respects the OS system preference when set to "System".

## 📦 Deployment (Vercel)

This project deploys on Vercel with these settings:

| Setting | Value |
|---------|-------|
| Framework | Vite |
| Build Command | `vite build` |
| Output Directory | `dist` |
| Environment Variables | `VITE_API_BASE_URL` |

## 👥 Developed By

- **Virendra** & **Prince**
- DC Office, Hamirpur, Himachal Pradesh
