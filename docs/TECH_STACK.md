# Nook - Technical Stack Documentation

## Overview

Nook is a modern, mobile-first inventory management SaaS built with a serverless architecture optimized for multi-tenant scalability.

---

## Frontend Stack

### Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.0.10 | React framework with App Router, Server Components, Turbopack |
| **React** | 19.2.3 | UI library with Server Components support |
| **TypeScript** | 5.9.3 | Type-safe JavaScript |

### Styling
| Technology | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | 4.1.18 | Utility-first CSS framework |
| **FlyonUI** | 2.4.1 | Component library (DaisyUI-compatible) |
| **tailwind-merge** | 2.6.0 | Merge Tailwind classes without conflicts |
| **clsx** | 2.1.1 | Conditional className utility |

### UI Components
| Technology | Version | Purpose |
|------------|---------|---------|
| **Lucide React** | 0.468.0 | Icon library |
| **jsPDF** | 3.0.4 | PDF generation for labels/reports |
| **qrcode** | 1.5.4 | QR code generation |

### Forms & Validation
| Technology | Version | Purpose |
|------------|---------|---------|
| **React Hook Form** | 7.54.1 | Form state management |
| **@hookform/resolvers** | 3.9.1 | Zod integration for RHF |
| **Zod** | 3.24.1 | Schema validation |

### State Management
| Technology | Version | Purpose |
|------------|---------|---------|
| **Zustand** | 5.0.2 | Lightweight state management |

### Utilities
| Technology | Version | Purpose |
|------------|---------|---------|
| **date-fns** | 4.1.0 | Date manipulation |

---

## Backend Stack

### Database & Auth
| Technology | Version | Purpose |
|------------|---------|---------|
| **Supabase** | 2.47.10 | PostgreSQL database, Auth, Storage, Realtime |
| **@supabase/ssr** | 0.5.2 | Server-side rendering support |

### AI Integration
| Technology | Version | Purpose |
|------------|---------|---------|
| **@google/generative-ai** | 0.24.1 | Google Gemini AI for insights & chat |

---

## Infrastructure

### Hosting
- **Vercel** (recommended) - Zero-config Next.js deployment
- **Supabase Cloud** - Managed PostgreSQL with edge functions

### Database
- **PostgreSQL 15+** via Supabase
- **pgvector** extension for AI embeddings
- **pg_trgm** extension for fuzzy search

### Storage
- **Supabase Storage** - S3-compatible object storage for images

---

## Development Tools

### Build & Dev
| Tool | Purpose |
|------|---------|
| **Turbopack** | Fast development bundler (Next.js 16 default) |
| **ESLint** | Code linting |
| **PostCSS** | CSS processing for Tailwind v4 |

### Type Definitions
| Package | Purpose |
|---------|---------|
| **@types/node** | Node.js types |
| **@types/react** | React types |
| **@types/react-dom** | React DOM types |
| **@types/qrcode** | QRCode library types |

---

## Project Structure

```
nook-master/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth routes (login, signup, etc.)
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles (Tailwind v4)
├── components/            # React components
│   ├── labels/            # Label printing components
│   ├── layout/            # Layout components (sidebar, header)
│   ├── onboarding/        # Onboarding wizard
│   └── ui/                # Reusable UI components
├── lib/                   # Utility functions & services
│   ├── ai/                # AI integration (Gemini)
│   ├── labels/            # Barcode/QR generation
│   └── supabase/          # Supabase client utilities
├── supabase/              # Supabase configuration
│   └── migrations/        # Database migrations (12 files)
├── types/                 # TypeScript type definitions
├── docs/                  # Documentation
└── .claude/               # AI coding rules
```

---

## Key Configuration Files

### `next.config.ts`
```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}
```

### `tailwind.config.ts`
- FlyonUI plugin integration
- Custom `nook-red` theme
- Corporate theme as default

### `postcss.config.mjs`
```javascript
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

### `globals.css` (Tailwind v4 syntax)
```css
@import "tailwindcss";
@plugin "flyonui";
@import "../node_modules/flyonui/variants.css";

@theme {
  --font-family-sans: 'Inter', system-ui, sans-serif;
  --color-primary: #de4a4a;
  /* ... */
}
```

---

## Environment Variables

Required variables in `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Gemini AI
GOOGLE_AI_API_KEY=your-gemini-api-key
```

See `.env.example` for the full template.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Mobile-first design with responsive breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px
