# Typaa

Typaa is a web-first prototype for social discovery, entertainment, and paper trading in one product.

## Run locally

The project is being migrated in place to Next.js, TypeScript, Tailwind CSS, and Supabase while preserving the existing Typaa interface and working features.

1. Install Node.js 20.9 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and add credentials for integrations you have configured.
4. Run `npm run dev`, then open `http://localhost:3000`.

The current Next.js entry point mounts the existing application markup and browser interactions during migration. The existing app routes continue to work; feature-by-feature conversion to native Next.js routes is still in progress.

## Project direction

- `app/` contains the Next.js App Router entry points, market-detail page, and server API routes.
- `src/lib/supabase/` contains server-safe and browser Supabase client factories.
- `supabase/migrations/` contains the RLS-protected post table and private media bucket setup.
- `index.html`, `styles.css`, and `app.js` preserve the current interface during the staged migration.
- `.env.example` documents Supabase and market-data configuration. Never put secret keys in browser code.

The post composer now supports validated image/video selection and previews, optional feeling/manual location fields, and a real authenticated `POST /api/posts` flow. It stores media privately in Supabase Storage, enforces ownership through Row Level Security, and gives a clear configuration/sign-in error when the backend is unavailable. Apply the SQL migration in `supabase/migrations/` and configure Supabase before publishing; the frontend does not report a post as published until the server confirms the save.

The prototype includes editable profile/settings controls, leverage up to 100x, TradingView-inspired chart modes and tools, buy/sell states, a custom market-alert ringtone picker, watchlist additions, and a home candlestick chart. The theme selector persists Dark, Light, and System preferences. The trade terminal now searches the loaded Forex catalog, top 50 USDT crypto pairs, and listed US/Indian equities; selecting an instrument opens its internal `/markets/[symbol]` detail page.

Binance crypto details use a server API route and public market endpoints. Forex and stock quotes require a licensed provider account; set `TWELVE_DATA_API_KEY` only in the server environment to enable the Twelve Data quote/history adapter. Without it, the detail page explicitly shows that price data is unavailable. Expert recommendations are not fabricated; an authorized research feed is not configured. Related posts are filtered from the current home feed and are not yet persisted as a social backend.

AllTick requires an API token. Set it in a protected server-side runtime and expose it to the app through a secure server integration; do not put a real token in committed frontend files. The browser intentionally shows a token-required state instead of fake Forex candles when no secure integration is configured.

The Watch view includes 50 non-duplicated 2025–26 recommendations with poster searches and YouTube trailer-search links, plus Internet Archive feature films marked with a CC0 public-domain license that stream in-app. Recommendations are search suggestions, not direct movie streams. The app can also fetch up to 1,000 long-form, embeddable YouTube search results marked Creative Commons through `api/youtube-films.js`; configure `YOUTUBE_DATA_API_KEY` as a server-side Vercel environment variable. Results are fetched 50 at a time and deduplicated. Users can add direct YouTube video links, which play through YouTube's privacy-enhanced embed. YouTube's CC label is supplied by the uploader and should not be treated as independent rights verification. Subscription/DRM catalogs such as Prime Video cannot be filtered into or embedded in this third-party player; Typaa does not bypass DRM, download, or re-upload films.

The trading terminal displays the account value as “Balance”; the funds are virtual paper-trading funds, not real money. Paper trading remains simulated; no brokerage orders are sent.

The Next.js migration is a foundation, not a claim that all production integrations are connected. Supabase client helpers require configured public URL and anon-key values, a Supabase-authenticated session, and the included SQL migration. Authentication screens, account/profile persistence, and broader social feed access still need to be implemented. Connect `MARKET_DATA_PROVIDER` through a server-side adapter before offering licensed market data.

## Safety and data

Do not commit real Supabase or market-data credentials. Live market data may require provider subscriptions and exchange licensing. This prototype does not provide financial advice or real trading.
