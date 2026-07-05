
# Plan — NameGadget system upgrade (Waves 2–4)

Wave 1 (dashboard rebuild — Domain · Visitors · Expiry · Gadget+ · Lander select · Registrar, real-time sync, rounded-square logo, MCP server with `find_leads` + `visitor_stats` + pagination on dashboard/portfolio) is already live. This plan covers everything still pending, with sensible defaults chosen so we can start immediately.

## Wave 2 — Gadget Hub: Outbound engine + Leaflet live map

### Outbound Leads panel inside `/gadget-ai`
- New tab alongside the appraisal: **Outbound**. Input: keyword or the currently-appraised domain. Output: a table of potential corporate buyers.
- Server function `findOutboundLeads({ domain, keyword, industry?, limit? })` (existing MCP `find_leads` tool reused server-side, `google/gemini-3-flash-preview` via Lovable AI Gateway).
- Each lead row: **Company · Website · Email · Phone · Fit reason · Score**.
- Data cleaning: emails/phones extracted via regex on model output + optional server-side fetch of the company site's `/contact` HTML to pull real `mailto:` / `tel:` links when present (fallback to plausible `hello@`, `info@`).
- Persist to new `public.outbound_leads` (RLS: owner-only; realtime enabled).
- Export UX: **Copy all**, **Copy emails**, **Copy phones**, **Download CSV**, per-row copy buttons — clear, boutique styling matching current emerald/mono aesthetic.

### Leaflet live visitor map
- Install `leaflet` + `react-leaflet` + types.
- New `<VisitorMap/>` on `/gadget-ai` (and portfolio drawer): world map, pulsing dots per recent visit, click a dot for domain + country + timestamp.
- Data source: new `public.visits` table (`id, domain_id, ts, country, region, city, lat, lon, referrer, ua_hash`), RLS owner-only, realtime enabled.
- Ingest: new public route `/api/public/track/$landerId` — 1×1 pixel endpoint that reads Cloudflare `cf-ipcountry` / `cf-iplatitude` / `cf-iplongitude` headers, inserts a `visits` row via a scoped edge insert (no external geo-IP service needed).
- Landing pages (`src/components/landers.tsx`) get a hidden `<img src="/api/public/track/{landerId}?d={domain_id}" />` beacon.
- Portfolio `visitor_count` auto-syncs via a Postgres trigger on `visits` insert.

### Skeletons + UX polish (applies globally)
- Add shared `RowSkeleton`, `CardSkeleton`, `MapSkeleton`, `ChatSkeleton` under `src/components/ui/skeletons.tsx`.
- Retrofit: portfolio table, dashboard table, gadget appraisal, deal-room chat, outbound leads table.
- **Row buttons**: consistent 32×32 hit area, `focus-visible` ring, tooltip via `title`, `active:scale-97`, disabled state, keyboard `Enter`.
- **Live pulse fix**: replace polling-based "live" indicators with Supabase realtime status; green dot only when channel `SUBSCRIBED`, amber on reconnect, red on error, with reconnect counter.

## Wave 3 — Public profiles, buyer accounts

### Public buyer/seller profile
- New route `src/routes/u.$handle.tsx` (public, SSR): avatar, display name, bio, verification badge, member since, star rating (avg from `deal_reviews`), and a grid of their public domains + closed sales count.
- Loader uses server publishable client + narrow `TO anon` SELECT policies on new tables.
- OG tags + `og:image` derived from profile data.

### Schema additions
- `public.profiles` (extends the auth user): `handle` (unique), `display_name`, `bio`, `avatar_url`, `verification` enum (`none|email|id|top_broker`), `created_at`. Trigger to auto-create profile on new user.
- `public.deal_reviews`: `deal_id`, `reviewer_id`, `subject_id`, `stars`, `comment`.
- All with GRANTs + RLS per Cloud rules.

### Buyer account surface (extends existing `_authenticated/account.tsx`)
- Tabs: **Profile** (handle, bio, avatar upload) · **Watchlist** · **Offers made** · **Purchases** · **Security** (change email, password, 2FA TOTP toggle) · **Notifications** (email digests, offer pings).
- `public.watchlist` table; add "Watch" button on public domain pages `d/$domain`.

## Wave 4 — Plans & admin

### Plans page
- New `src/routes/pricing.tsx` (public) matching the landing-page tiers: **Gadget (Free) · Gadget+ ($19.99/mo) · Ultra Gadget ($49.99/mo)**.
- Comparison table, monthly/annual toggle (reuses landing animation).
- `public.subscriptions` table (`user_id, tier, status, current_period_end`). Manual upgrade for now (Stripe wiring optional follow-up — payment provider not enabled yet, so upgrade buttons trigger a "coming soon" toast + save intent).
- Gate features: `find_leads` and Leaflet map require `tier >= plus`; UI shows soft upsell instead of blocking.

### Admin surface + safe bootstrap
- `user_roles` table + `has_role(uuid, app_role)` security-definer function (per user-roles rules).
- New `src/routes/_authenticated/_admin/` layout gated by `has_role('admin')`; child routes: **Users**, **Domains**, **Deals**, **Flags**.
- Bootstrap: env secret `ADMIN_BOOTSTRAP_TOKEN`; a discreet dev banner on `/account` reads "Enter admin token" for the signed-in user, server fn validates the token constant-time and inserts an `admin` row. No auto-provisioned credentials, no localStorage flags, no hardcoded emails.

### Brand DNA guardrails (every wave)
- Emerald primary, mono uppercase micro-labels, boutique borders, `text-glow` accents, existing rounded-square logo. No new fonts, no gradients outside `.gradient-brand`.

## Technical notes
- All new server logic uses `createServerFn` (`.functions.ts`) with `requireSupabaseAuth`; public track endpoint is a `/api/public/*` server route with signature-free rate limiting on Cloudflare headers.
- Every new `public.*` table ships with `GRANT` block + RLS policies + realtime `ALTER PUBLICATION` in the same migration.
- MCP manifest re-extracted after any tool change.

## Defaults chosen (was blocking before)
1. **Order**: Wave 2 first (Outbound + Map + skeletons + button UX + live-state fix), then 3, then 4.
2. **Outbound provider**: Lovable AI Gateway + server-side contact-page fetch. Zero user-supplied keys.
3. **Visitor tracking**: 1×1 pixel injected into all landers; Cloudflare geo headers, no third-party service.
4. **Admin bootstrap**: env-token promotion via account-page banner. No auto-provisioned admin credentials.

Say **go** to start Wave 2, or override any default and I'll adjust before building.
