import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ShieldCheck, Globe2, Star, Calendar } from "lucide-react";
import { z } from "zod";

const getProfile = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) => z.object({ handle: z.string().min(1) }).parse(raw))
  .handler(async ({ data }) => {
    const sb = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    const { data: profile } = await sb
      .from("profiles")
      .select("id,handle,display_name,bio,avatar_url,verification,created_at")
      .eq("handle", data.handle)
      .maybeSingle();
    if (!profile) return null;
    const [{ data: domains }, { data: reviews }] = await Promise.all([
      sb.from("domains").select("id,domain_name,status,visitor_count,appraised_value").eq("owner_id", profile.id).eq("status", "For Sale").limit(24),
      sb.from("deal_reviews").select("stars,comment,created_at").eq("subject_id", profile.id).limit(20),
    ]);
    const avg = reviews && reviews.length ? reviews.reduce((s, r) => s + r.stars, 0) / reviews.length : 0;
    return { profile, domains: domains ?? [], reviews: reviews ?? [], avgStars: avg };
  });

const profileQuery = (handle: string) =>
  queryOptions({
    queryKey: ["profile", handle],
    queryFn: () => getProfile({ data: { handle } }),
  });

export const Route = createFileRoute("/u/$handle")({
  loader: async ({ params, context }) => {
    const data = await context.queryClient.ensureQueryData(profileQuery(params.handle));
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.profile.display_name ?? loaderData?.profile.handle} — NameGadget` },
      { name: "description", content: loaderData?.profile.bio ?? `${loaderData?.profile.handle} on NameGadget` },
      { property: "og:title", content: `${loaderData?.profile.display_name ?? loaderData?.profile.handle} — NameGadget` },
      { property: "og:description", content: loaderData?.profile.bio ?? "Domain investor on NameGadget" },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PublicProfile,
  errorComponent: ({ error }) => <div className="p-12 text-center text-danger">{String(error)}</div>,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground font-mono text-sm">
      Profile not found.
    </div>
  ),
});

function PublicProfile() {
  const { data } = useSuspenseQuery(profileQuery(Route.useParams().handle));
  if (!data) return null;
  const { profile, domains, reviews, avgStars } = data;
  const memberSince = new Date(profile.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long" });
  const verified = profile.verification !== "none";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 h-14 flex items-center">
          <Link to="/" className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground">
            ← NameGadget
          </Link>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 space-y-8">
        <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-5 sm:items-center">
            <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold shrink-0">
              {(profile.display_name ?? profile.handle ?? "?").slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{profile.display_name ?? profile.handle}</h1>
                {verified && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-xs font-mono text-primary">
                    <ShieldCheck className="h-3 w-3" /> {profile.verification}
                  </span>
                )}
              </div>
              <div className="text-xs font-mono text-muted-foreground mt-1">@{profile.handle}</div>
              {profile.bio && <p className="mt-3 text-sm text-muted-foreground max-w-2xl">{profile.bio}</p>}
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground font-mono">
                <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Member since {memberSince}</span>
                <span className="inline-flex items-center gap-1.5"><Star className="h-3.5 w-3.5" /> {avgStars.toFixed(1)} ({reviews.length})</span>
                <span className="inline-flex items-center gap-1.5"><Globe2 className="h-3.5 w-3.5" /> {domains.length} listed</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 font-mono">Portfolio</h2>
          {domains.length === 0 ? (
            <div className="rounded-xl border border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
              No public listings.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {domains.map((d) => (
                <Link
                  key={d.id}
                  to="/d/$domain"
                  params={{ domain: d.domain_name }}
                  className="rounded-xl border border-border bg-card hover:border-primary/40 transition p-4 group"
                >
                  <div className="font-semibold truncate group-hover:text-primary transition">{d.domain_name}</div>
                  <div className="mt-2 flex items-center justify-between text-xs font-mono text-muted-foreground">
                    <span>{d.visitor_count?.toLocaleString() ?? 0} visits</span>
                    {d.appraised_value ? (
                      <span className="text-primary">${d.appraised_value.toLocaleString()}</span>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
