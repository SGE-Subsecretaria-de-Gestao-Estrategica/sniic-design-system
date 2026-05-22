/**
 * Generates unified SVG path data for Brazil's 5 macro-regions.
 *
 * Uses topojson-server + topojson-client to dissolve internal state borders,
 * producing a single clean outer boundary per region (no internal seams).
 *
 * Run: node scripts/generate-region-paths.cjs
 */
const fs = require('fs');
const d3 = require('d3');
const topojson = require('topojson-server');
const topojsonClient = require('topojson-client');

const EPSILON = 0.8;
const PRECISION = 1;

const REGION_MAP = {
	Norte: ['AC', 'AM', 'AP', 'PA', 'RO', 'RR', 'TO'],
	Nordeste: ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
	CentroOeste: ['DF', 'GO', 'MS', 'MT'],
	Sudeste: ['ES', 'MG', 'RJ', 'SP'],
	Sul: ['PR', 'RS', 'SC'],
};

function perpDist(p, a, b) {
	const dx = b[0] - a[0];
	const dy = b[1] - a[1];
	if (dx === 0 && dy === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
	const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy);
	return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

function douglasPeucker(pts, epsilon) {
	if (pts.length < 3) return pts;
	let maxDist = 0, maxIdx = 0;
	for (let i = 1; i < pts.length - 1; i++) {
		const d = perpDist(pts[i], pts[0], pts[pts.length - 1]);
		if (d > maxDist) { maxDist = d; maxIdx = i; }
	}
	if (maxDist > epsilon) {
		const left = douglasPeucker(pts.slice(0, maxIdx + 1), epsilon);
		const right = douglasPeucker(pts.slice(maxIdx), epsilon);
		return left.slice(0, -1).concat(right);
	}
	return [pts[0], pts[pts.length - 1]];
}

function fmt(n) {
	return parseFloat(n.toFixed(PRECISION));
}

function ringToPath(ring) {
	if (ring.length < 3) return '';
	const pts = ring.map(p => `${fmt(p[0])},${fmt(p[1])}`);
	return `M${pts[0]}L${pts.slice(1).join('L')}Z`;
}

function geomToPath(geom, projection, epsilon) {
	const polys = geom.type === 'Polygon'
		? [geom.coordinates]
		: geom.type === 'MultiPolygon'
		? geom.coordinates
		: [];

	return polys.flatMap(poly =>
		poly.map(ring => {
			const projected = ring.map(c => projection(c)).filter(Boolean);
			if (projected.length < 3) return '';
			const simplified = douglasPeucker(projected, epsilon);
			return ringToPath(simplified);
		}).filter(Boolean)
	).join(' ');
}

const geojson = JSON.parse(
	fs.readFileSync(`${__dirname}/../public/geo/brazil-states.geojson`, 'utf8')
);

// Build map sigla -> feature
const featureMap = {};
for (const f of geojson.features) {
	featureMap[f.properties.sigla] = f;
}

const result = {};

for (const [region, states] of Object.entries(REGION_MAP)) {
	const regionFeatures = states
		.map(uf => featureMap[uf])
		.filter(Boolean);

	if (regionFeatures.length === 0) {
		process.stderr.write(`WARNING: no features for region ${region}\n`);
		continue;
	}

	// Build a FeatureCollection for this region
	const fc = {
		type: 'FeatureCollection',
		features: regionFeatures,
	};

	// Convert to topology so topojson can dissolve shared borders
	const topo = topojson.topology({ region: fc });

	// Merge all state geometries → single unified polygon (dissolves internal borders)
	const merged = topojsonClient.merge(topo, topo.objects.region.geometries);

	// Fit the merged geometry to 100×100
	const mergedFeature = { type: 'Feature', geometry: merged, properties: {} };
	const projection = d3.geoMercator().fitSize([100, 100], mergedFeature);

	const path = geomToPath(merged, projection, EPSILON);
	result[region] = path;
	process.stderr.write(`${region}: ${path.length} chars\n`);
}

const REGION_ORDER = ['Norte', 'Nordeste', 'CentroOeste', 'Sudeste', 'Sul'];

const lines = REGION_ORDER.map(r => `\t${r}: '${result[r] ?? ''}',`);

const ts = `/**
 * Pre-computed simplified SVG path data for Brazil's five macro-regions.
 *
 * Paths were generated from the IBGE GeoJSON using topojson-server/client to
 * dissolve internal state borders, then projected with d3-geo's
 * geoMercator().fitSize([100, 100], mergedFeature) and simplified with
 * Douglas-Peucker (ε=${EPSILON}).
 * Each path fits in a 100 × 100 coordinate space.
 */

export type BrazilRegion = 'Norte' | 'Nordeste' | 'CentroOeste' | 'Sudeste' | 'Sul';

export const BRAZIL_REGION_LABELS: Record<BrazilRegion, string> = {
\tNorte: 'Norte',
\tNordeste: 'Nordeste',
\tCentroOeste: 'Centro-Oeste',
\tSudeste: 'Sudeste',
\tSul: 'Sul',
};

/** SVG path data for each region, normalised to a 100 × 100 viewBox. Internal state borders dissolved. */
export const BRAZIL_REGION_PATHS: Record<BrazilRegion, string> = {
${lines.join('\n')}
};

export interface RegionDatum {
\tregion: BrazilRegion;
\tvalue: number;
\tcolor?: string;
}
`;

process.stdout.write(ts);
