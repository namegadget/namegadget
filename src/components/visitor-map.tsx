import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Globe2, MapPin, Radio } from "lucide-react";

type Visit = {
  id: string;
  domain_id: string;
  ts: string;
  country: string | null;
  city: string | null;
  lat: number | null;
  lon: number | null;
};

type Props = {
  domainId?: string; // if omitted, aggregates across all owned domains
  height?: number;
};

/** Country → approximate centroid (lat, lon) for fallback plotting */
const CENTROIDS: Record<string, [number, number]> = {
  US: [39.8, -98.6], CA: [56.1, -106.3], MX: [23.6, -102.5], BR: [-14.2, -51.9],
  AR: [-38.4, -63.6], GB: [55.4, -3.4], FR: [46.6, 2.2], DE: [51.2, 10.5],
  ES: [40.5, -3.7], IT: [41.9, 12.6], NL: [52.1, 5.3], PL: [51.9, 19.1],
  SE: [60.1, 18.6], NO: [60.5, 8.5], FI: [61.9, 25.7], DK: [56.3, 9.5],
  CH: [46.8, 8.2], BE: [50.5, 4.5], PT: [39.4, -8.2], IE: [53.4, -8.2],
  AT: [47.5, 14.6], GR: [39.1, 21.8], TR: [38.9, 35.2], RU: [61.5, 105.3],
  UA: [48.4, 31.2], IL: [31.0, 34.9], SA: [23.9, 45.1], AE: [23.4, 53.8],
  IN: [20.6, 78.9], PK: [30.4, 69.3], CN: [35.9, 104.2], JP: [36.2, 138.3],
  KR: [35.9, 127.8], TW: [23.7, 121.0], HK: [22.4, 114.1], SG: [1.35, 103.8],
  MY: [4.2, 101.9], TH: [15.9, 100.9], VN: [14.1, 108.3], ID: [-0.8, 113.9],
  PH: [12.9, 121.8], AU: [-25.3, 133.8], NZ: [-40.9, 174.9], ZA: [-30.6, 22.9],
  NG: [9.1, 8.7], EG: [26.8, 30.8], MA: [31.8, -7.1], KE: [-0.0, 37.9],
};

function coord(v: Visit): [number, number] | null {
  if (v.lat != null && v.lon != null) return [v.lat, v.lon];
  if (v.country && CENTROIDS[v.country.toUpperCase()]) return CENTROIDS[v.country.toUpperCase()];
  return null;
}

export function VisitorMap({ domainId, height = 380 }: Props) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [live, setLive] = useState<"connecting" | "live" | "offline">("connecting");
  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);

  // Initial load + realtime subscription
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let q = supabase.from("visits").select("*").order("ts", { ascending: false }).limit(200);
      if (domainId) q = q.eq("domain_id", domainId);
      const { data, error } = await q;
      if (cancelled) return;
      if (error) { setStatus("error"); return; }
      setVisits((data as Visit[]) ?? []);
      setStatus("ready");
    })();

    const filter = domainId ? `domain_id=eq.${domainId}` : undefined;
    const ch = supabase
      .channel(`visits-${domainId ?? "all"}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "visits", ...(filter ? { filter } : {}) },
        (payload) => setVisits((prev) => [payload.new as Visit, ...prev].slice(0, 200)),
      )
      .subscribe((s) => {
        setLive(s === "SUBSCRIBED" ? "live" : s === "CHANNEL_ERROR" || s === "CLOSED" ? "offline" : "connecting");
      });
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [domainId]);

  // Init Leaflet map (client only, dynamic import to keep SSR clean)
  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;
    let disposed = false;
    (async () => {
      const L = await import("leaflet");
      if (disposed || !mapEl.current) return;
      const map = L.map(mapEl.current, {
        center: [20, 0], zoom: 2, minZoom: 2, worldCopyJump: true,
        zoomControl: true, attributionControl: false,
      });
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", {
        maxZoom: 10, subdomains: "abcd",
      }).addTo(map);
      mapRef.current = map;
      layerRef.current = L.layerGroup().addTo(map);
    })();
    return () => {
      disposed = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; layerRef.current = null; }
    };
  }, []);

  // Render markers whenever visits change
  useEffect(() => {
    (async () => {
      if (!mapRef.current || !layerRef.current) return;
      const L = await import("leaflet");
      layerRef.current.clearLayers();
      const seen = new Map<string, number>();
      for (const v of visits) {
        const c = coord(v);
        if (!c) continue;
        const key = `${c[0].toFixed(2)},${c[1].toFixed(2)}`;
        seen.set(key, (seen.get(key) ?? 0) + 1);
      }
      for (const [key, count] of seen) {
        const [lat, lon] = key.split(",").map(Number);
        const radius = Math.min(4 + Math.log2(count + 1) * 3, 18);
        L.circleMarker([lat, lon], {
          radius, color: "#10b981", weight: 1.5, fillColor: "#10b981", fillOpacity: 0.35,
        }).bindTooltip(`${count} visit${count === 1 ? "" : "s"}`, { className: "leaflet-tooltip-brand" })
          .addTo(layerRef.current);
      }
    })();
  }, [visits]);

  const recentCountries = useMemo(() => {
    const cts = new Map<string, number>();
    for (const v of visits.slice(0, 50)) {
      const k = (v.country ?? "??").toUpperCase();
      cts.set(k, (cts.get(k) ?? 0) + 1);
    }
    return Array.from(cts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [visits]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Globe2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground truncate">Live Visitor Map</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            {visits.length} pings
          </span>
          <span
            className={`inline-flex items-center gap-1.5 h-6 px-2 rounded-md text-[10px] font-mono uppercase tracking-widest border ${
              live === "live" ? "bg-primary/10 border-primary/40 text-primary"
              : live === "offline" ? "bg-rose-500/10 border-rose-500/40 text-rose-600"
              : "bg-amber-500/10 border-amber-500/40 text-amber-600"
            }`}
            title={`Realtime: ${live}`}
          >
            <Radio className={`h-2.5 w-2.5 ${live === "live" ? "animate-pulse" : ""}`} />
            {live}
          </span>
        </div>
      </div>

      <div className="relative">
        <div ref={mapEl} style={{ height }} className="w-full bg-muted/20" />
        {status === "loading" && (
          <div className="absolute inset-0 grid place-items-center bg-background/60 backdrop-blur-sm text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Loading visitor pings…
          </div>
        )}
        {status === "ready" && visits.length === 0 && (
          <div className="absolute inset-0 grid place-items-center pointer-events-none text-center px-6">
            <div className="max-w-sm space-y-1.5">
              <div className="text-sm font-semibold text-foreground">No visits yet</div>
              <div className="text-xs text-muted-foreground">
                Publish any lander to start recording visitor geo pings — every hit shows up here in real time.
              </div>
            </div>
          </div>
        )}
      </div>

      {recentCountries.length > 0 && (
        <div className="px-5 py-3 border-t border-border flex items-center gap-2 flex-wrap">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          {recentCountries.map(([code, n]) => (
            <span key={code} className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-md bg-muted/50 border border-border text-muted-foreground">
              {code} · {n}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
