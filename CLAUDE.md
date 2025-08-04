# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

**Development & Build**
- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm run start` - Start production server on port 3000
- `npm run lint` - Run ESLint checks
- `npm run analyze` - Build with bundle analyzer

**Testing**
- `npm run test` - Run Jest unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run test:e2e` - Run Playwright end-to-end tests
- `npm run test:e2e:ui` - Run E2E tests with UI
- `npm run test:evolution` - Run Evolution Gaming specific tests
- `npm run test:integration` - Run integration tests with microservices
- `npm run test:all` - Run complete test suite

**Microservices Development**
- `npm run microservices:install` - Install all microservice dependencies
- `npm run microservices:dev` - Start all microservices concurrently
- `npm run microservices:auth` - Start auth service only
- `npm run microservices:games` - Start games service only
- `npm run microservices:websocket` - Start websocket gateway only
- `npm run microservices:gateway` - Start API gateway only

## Architecture Overview

### Core Technology Stack
- **Framework**: Next.js 15 with App Router
- **UI**: React 19 with Tailwind CSS and Radix UI components
- **Data**: Apollo Client for GraphQL with Strapi CMS backend
- **State**: Context-based state management with error boundaries
- **Testing**: Jest + React Testing Library + Playwright
- **PWA**: Next-PWA with service worker and offline support

### Application Structure
```
src/
├── app/                    # Next.js App Router pages
├── components/            # React components organized by feature
│   ├── _home/            # Homepage specific components
│   ├── _slots/           # Slot machine related components
│   ├── _stats/           # Live statistics components
│   ├── _live/            # Live streaming components
│   ├── ui/               # Reusable UI components (shadcn/ui)
│   └── shared/           # Shared utility components
├── lib/                   # Core utilities and configurations
│   ├── apollo.ts         # GraphQL client setup
│   ├── config.ts         # Environment and URL configuration
│   └── graphql/queries.ts # All GraphQL queries and mutations
├── hooks/                 # Custom React hooks
├── contexts/             # React Context providers
├── types/                # TypeScript type definitions
└── utils/                # Helper functions
```

### Data Layer Architecture
- **GraphQL**: Apollo Client with comprehensive error handling and mobile-optimized networking
- **Queries**: All GraphQL operations centralized in `src/lib/graphql/queries.ts`
- **State Management**: Context-based providers for global state (search, accessibility, age verification, cookies)
- **Caching**: Apollo InMemoryCache with error-tolerant policies

### Key Features & Systems
1. **Live Casino Statistics**: Real-time game results via WebSocket and GraphQL subscriptions
2. **Slot Demo System**: Demo game integration with provider-specific configurations
3. **Content Management**: Strapi CMS integration for slots, providers, blog posts, and partners
4. **Accessibility**: Comprehensive WCAG compliance with screen reader support
5. **Legal Compliance**: Age verification and GDPR cookie consent systems
6. **PWA Features**: Offline support, caching strategies, and mobile app capabilities

### Environment Configuration
- Development uses `localhost:1337` for Strapi backend
- Mobile testing supported via `NEXT_PUBLIC_DEV_SERVER_IP` environment variable
- Production URLs configured via `NEXT_PUBLIC_STRAPI_URL`
- CORS proxy for Evolution Gaming API at `/api/evolution/*`

### Component Patterns
- Components organized by feature prefix (`_home/`, `_slots/`, `_stats/`)
- Shared UI components use shadcn/ui pattern in `components/ui/`
- Context providers wrap the app in `app/layout.tsx` with specific order for legal compliance
- Error boundaries and loading states managed globally via AppStateContext

### GraphQL Schema Integration
- All entities include SEO metadata fields
- Pagination and filtering supported across all content types
- Real-time game results with configurable retention periods
- Provider-specific bonus and statistics tracking

### Mobile & Development Considerations
- Mobile-first responsive design with Tailwind CSS
- Development server supports mobile device testing via network IP
- Comprehensive error logging for network issues during mobile development
- Service worker handles offline scenarios and caching strategies

### Testing Strategy
- Unit tests with Jest and React Testing Library
- E2E tests with Playwright for user workflows
- Integration tests for microservice communication
- Evolution Gaming specific test suites for live statistics
- Coverage thresholds: 80% across all metrics

### Microservices Architecture
The application includes a microservices backend located in the `microservices/` directory:
- **Auth Service**: Handles user authentication and authorization
- **Games Service**: Manages game data and statistics
- **WebSocket Gateway**: Real-time communication for live statistics
- **API Gateway**: Routes and proxies requests between services
- **Shared Module**: Common utilities and types across services

All microservices can be managed using the npm scripts in the root package.json.

### Important Development Notes
- Live casino integration with Evolution Gaming API via proxy (`/api/evolution/*`)
- Mobile development supported with IP configuration via `NEXT_PUBLIC_DEV_SERVER_IP`
- Legal compliance order in layout.tsx: Age Verification → Cookie Consent → App Logic
- Error-tolerant Apollo Client configuration with comprehensive network error handling
- Comprehensive accessibility system with WCAG compliance
- PWA features with service worker and offline support

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.