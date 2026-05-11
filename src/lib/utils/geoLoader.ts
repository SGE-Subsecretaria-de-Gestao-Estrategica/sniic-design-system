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

const _stateCache: Record<string, unknown> = {};
const _stateInflight: Record<string, Promise<unknown> | undefined> = {};

/**
 * Reverses polygon ring winding order so d3 interprets them correctly.
 * d3 uses the right-hand rule: exterior rings must be clockwise.
 * Many GeoJSON sources (e.g. IBGE) use the RFC 7946 convention
 * (counter-clockwise exteriors), which d3 treats as covering the
 * entire globe *minus* the polygon, collapsing fitSize projections.
 */
function fixWinding(geojson: any): any {
  for (const feature of geojson.features ?? []) {
    const geom = feature.geometry;
    if (geom?.type === 'Polygon') {
      for (const ring of geom.coordinates) ring.reverse();
    } else if (geom?.type === 'MultiPolygon') {
      for (const polygon of geom.coordinates)
        for (const ring of polygon) ring.reverse();
    }
  }
  return geojson;
}

/** Fetches /geo/states/{uf}.geojson once and caches per UF. */
export async function loadStateGeoJSON(uf: string): Promise<any> {
  if (_stateCache[uf]) return _stateCache[uf];
  if (_stateInflight[uf] != null) return _stateInflight[uf];
  _stateInflight[uf] = fetch(`/geo/states/${uf}.geojson`)
    .then((r) => r.json())
    .then((data) => {
      fixWinding(data);
      _stateCache[uf] = data;
      delete _stateInflight[uf];
      return data;
    });
  return _stateInflight[uf];
}
