This is ~9 major feature areas. Shipping it all in one turn would produce shallow, buggy code across the whole app. I'll break it into 4 waves so each wave is verifiable and preserves the brand DNA (light theme, emerald accents, solid borders, mono eyebrows, no gradients, rounded-square logo).

## Wave 1 — Foundations & UI polish (this turn if you approve)
- **Loading skeletons**: shared `<RowSkeleton/>`, `<CardSkeleton/>`, `<ChatSkeleton/>` reused on dashboard, portfolio, deal room, gadget, profiles.
- **Row button UX**: bigger hit target, hover/active states, focus ring, tooltip, keyboard accessible. Applied to portfolio + dashboard rows.
- **Dashboard domain table** in the exact order you specified: `Domain (+copy, favicon) · Visitors (sparkline) · Expiry countdown (red<30 / orange<90 / green) · Gadget+ button · Lander select · Registrar badge`. Visitors + expiry pulled from real data (visits table + RDAP cache). Lander select writes back to DB immediately.
- **Rounded-square logo** everywhere (sidebar, root head, favicons stay as-is).
- **Deal Room split layout** cleanup: left = domain/terms/escrow panel, right = chat timeline, distinct system-message bubbles, sticky "Generate Escrow Payment" action bar.
- **Real-time**: subscribe to `deals`, `messages`, `visits` via Supabase realtime channels (already available). Countdown clocks use a single `useCountdown` hook.

## Wave 2 — Gadget Hub: Outbound + Leaflet
Analyzing the NameMaxi screenshots: it's a lead-finder that takes a domain, runs Lite (fast domain-similarity) or Deep ($0.05, web-content) search, returns 3 tabs — **Domain Match / Content Match / Filtered** — each row = score /5, title, snippet, `Try 5 / Try 20` (or `Extract 5/20`) buttons that scrape emails, plus `Report Not Relevant` + `Visit Site`. I'll replicate that inside `/gadget-ai`:
- New Outbound tab next to the appraisal report.
- Server fn `findOutboundLeads({ domain, mode })` using **Lovable AI Gateway** (`google/gemini-2.5-flash`) with a tool that calls a web-search endpoint — no external Serper key required. If you later add a Serper key I'll swap it in.
- Email + phone extraction via regex on fetched page HTML (server-side fetch inside the server fn); results stored in `outbound_leads` table so they're downloadable/copyable across sessions.
- Export: CSV download + one-click copy per row and per bulk selection.
- **Leaflet live visitor map** on the Gadget page: install `leaflet` + `react-leaflet`, feed it markers from the `visits` table (city/lat/lng captured by tracking pixel). Light + dark tile skins matching brand.
- New tracking pixel route `/api/public/track/:landerId` inserts a `visits` row with geo-IP (Cloudflare `cf` headers → country/city/lat/lng, no external service).

## Wave 3 — Profiles, Buyer accounts, Verification, 2FA
- Public profile route `/u/$handle` — bio, avatar, star rating, transaction count, verification badges, domain portfolio grid. SSR-safe, public read policy.
- `profiles` extended with `handle`, `bio`, `rating`, `verification_tier` (`none|verified|top_broker|identity`).
- Buyer dashboard sections under `/_authenticated/buyer/`: Watchlist, Offers (all/active/accepted/countered), Invoices (from escrow webhook history), Currency preference.
- Settings → Security section with 2FA toggle, QR modal, backup codes, TOTP verify input (frontend states + Supabase MFA enroll/verify calls).

## Wave 4 — Plans + Admin panel
- Pricing page + billing dashboard: Free / Pro Founder / Elite Portfolio, plan limits table, upgrade CTA. UI-only unless you say wire Stripe.
- `/_authenticated/_admin/*` layout gated by `has_role(admin)`:
  - Users (verify/ban/badge)
  - Domains (review reports, override status)
  - Escrow/transactions monitor
  - Global settings & analytics
- **Temporary admin credentials banner**: I will NOT auto-provision a shared admin password inside the app — that's a security landmine (anyone reading the banner becomes admin on the live site). Instead I'll add a `promote_me_to_admin` one-shot server fn gated by an env secret `ADMIN_BOOTSTRAP_TOKEN` you paste in — you sign in normally, hit the banner, paste the token, become admin. Banner only renders when `import.meta.env.DEV` or when your account has the token flag. Tell me if you'd rather I hard-code a dev-only email allowlist instead.

## Open questions before I start Wave 1
1. **Go / order?** Ship Wave 1 now, or a different order?
2. **Outbound provider**: OK to use Lovable AI + server-side fetch (no key needed), or do you want Serper.dev / Hunter.io (you'd add the key)?
3. **Visitor tracking**: your landers already ship — is it OK for me to inject a 1×1 pixel `<img>` into the lander template so `visits` starts filling immediately?
4. **Admin bootstrap**: env-token promotion (my recommendation) or dev-only email allowlist?

Answer 1–4 (or say "go, your judgment") and I'll start Wave 1 immediately.