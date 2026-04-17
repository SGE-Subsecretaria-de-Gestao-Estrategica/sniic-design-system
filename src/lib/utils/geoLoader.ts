let _cache: unknown = null;
let _inflight: Promise<unknown> | null = null;

/** Fetches /geo/brazil-states.geojson once and caches the result module-wide. */
export async function loadBrazilGeoJSON(): Promise<any> {
  if (_cache) return _cache;
  if (_inflight) return _inflight;
  _inflight = fetch('/geo/brazil-states.geojson')
    .then((r) => r.json())
    .then((data) => {
      _cache = data;
      _inflight = null;
      return data;
    });
  return _inflight;
}
