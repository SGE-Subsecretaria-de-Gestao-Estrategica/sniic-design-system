/**
 * Generates simplified SVG path data for Brazil's 27 states.
 * Each state is projected individually to a 100×100 coordinate space via geoMercator().fitSize().
 * Douglas-Peucker simplification is applied in projected space.
 *
 * Run: node scripts/generate-state-paths.cjs
 */
const fs = require('fs');
const d3 = require('d3');

const EPSILON = 0.8; // simplification tolerance in projected px (100×100 space)
const PRECISION = 1; // decimal places for output coordinates

const STATE_ORDER = [
	'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO',
	'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR',
	'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
];

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

function featureToPath(feature, epsilon) {
	// Fit this single state to 100x100
	const projection = d3.geoMercator().fitSize([100, 100], feature);

	const processRing = (coords) => {
		const projected = coords.map(c => projection(c)).filter(Boolean);
		if (projected.length < 3) return null;
		return douglasPeucker(projected, epsilon);
	};

	const geom = feature.geometry;
	const polys = geom.type === 'Polygon'
		? [geom.coordinates]
		: geom.type === 'MultiPolygon'
		? geom.coordinates
		: [];

	return polys.flatMap(poly =>
		poly.map(ring => {
			const simplified = processRing(ring);
			return simplified ? ringToPath(simplified) : '';
		}).filter(Boolean)
	).join('');
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
for (const uf of STATE_ORDER) {
	const feature = featureMap[uf];
	if (!feature) { process.stderr.write(`WARNING: no feature for ${uf}\n`); continue; }
	const path = featureToPath(feature, EPSILON);
	result[uf] = path;
	process.stderr.write(`${uf}: ${path.length} chars\n`);
}

// Output TypeScript source
const lines = STATE_ORDER.map(uf => `\t${uf}: '${result[uf] ?? ''}',`);

const ts = `/**
 * Pre-computed simplified SVG path data for Brazil's 27 states.
 *
 * Paths were generated from IBGE GeoJSON with Douglas-Peucker simplification (ε=${EPSILON})
 * using d3-geo's geoMercator().fitSize([100, 100], feature) per state.
 * Each path fits in a 100 × 100 coordinate space, centred at (50, 50).
 */

export type BrazilState =
\t| 'AC' | 'AL' | 'AM' | 'AP' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO'
\t| 'MA' | 'MG' | 'MS' | 'MT' | 'PA' | 'PB' | 'PE' | 'PI' | 'PR'
\t| 'RJ' | 'RN' | 'RO' | 'RR' | 'RS' | 'SC' | 'SE' | 'SP' | 'TO';

export const BRAZIL_STATE_LABELS: Record<BrazilState, string> = {
\tAC: 'Acre',
\tAL: 'Alagoas',
\tAM: 'Amazonas',
\tAP: 'Amapá',
\tBA: 'Bahia',
\tCE: 'Ceará',
\tDF: 'Distrito Federal',
\tES: 'Espírito Santo',
\tGO: 'Goiás',
\tMA: 'Maranhão',
\tMG: 'Minas Gerais',
\tMS: 'Mato Grosso do Sul',
\tMT: 'Mato Grosso',
\tPA: 'Pará',
\tPB: 'Paraíba',
\tPE: 'Pernambuco',
\tPI: 'Piauí',
\tPR: 'Paraná',
\tRJ: 'Rio de Janeiro',
\tRN: 'Rio Grande do Norte',
\tRO: 'Rondônia',
\tRR: 'Roraima',
\tRS: 'Rio Grande do Sul',
\tSC: 'Santa Catarina',
\tSE: 'Sergipe',
\tSP: 'São Paulo',
\tTO: 'Tocantins',
};

/** SVG path data for each state, normalised to a 100 × 100 viewBox. */
export const BRAZIL_STATE_PATHS: Record<BrazilState, string> = {
${lines.join('\n')}
};

export interface StateDatum {
\tstate: BrazilState;
\tvalue: number;
\tcolor?: string;
}
`;

process.stdout.write(ts);
