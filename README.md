# NutriTrack

A modern nutrition tracking app built with Next.js 16, Supabase, and AI-powered meal scanning.

## Features

- User authentication with Supabase Auth
- Food diary with meal logging (breakfast, lunch, dinner, snacks)
- Barcode scanning for packaged foods (Open Food Facts API)
- AI-powered meal scanning with DeepSeek API
- Personalized nutrition goals based on user profile
- Progress tracking and insights
- Dark mode UI with modern design

## Tech Stack

- **Framework**: Next.js 16.1.1 with Turbopack
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui + Radix UI
- **Animations**: Framer Motion
- **AI**: DeepSeek API for meal image analysis
- **Food Data**: Open Food Facts API

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- DeepSeek API key (optional, for AI meal scanning)

### Installation

1. Clone the repository:
```bash
git clone git@github.com:Juan-Oclock/NutriTrack.git
cd NutriTrack
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
DEEPSEEK_API_KEY=your_deepseek_api_key  # Optional
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Database Setup

Run the migrations in your Supabase project:

1. Go to Supabase Dashboard > SQL Editor
2. Run the migration file: `supabase/migrations/001_initial_schema.sql`
3. Optionally seed with sample foods: `supabase/seed.sql`

## Deploy on Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Juan-Oclock/NutriTrack)

### Manual Deploy

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com/new)
3. Add the following environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `DEEPSEEK_API_KEY` (optional)

4. Deploy!

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public key |
| `DEEPSEEK_API_KEY` | No | DeepSeek API key for AI meal scanning |
| `NEXT_PUBLIC_APP_URL` | No | App URL (defaults to Vercel URL) |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (main)/            # Main app pages (dashboard, diary, etc.)
│   ├── api/               # API routes
│   └── onboarding/        # Onboarding flow
├── components/            # React components
│   ├── layout/           # Layout components
│   └── ui/               # UI components (shadcn/ui)
├── lib/                   # Utilities and configurations
│   ├── supabase/         # Supabase client setup
│   └── utils/            # Helper functions
└── types/                # TypeScript types
```

## License

MIT
