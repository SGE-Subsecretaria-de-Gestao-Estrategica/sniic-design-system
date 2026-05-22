// Exported data types for sniic-dsm chart components.
// Defined here (not inside .svelte files) so vite-plugin-dts can emit them properly.

export interface TableColumn {
	key: string;
	label: string;
	align?: 'left' | 'center' | 'right';
	width?: number;
}

export interface TooltipHelpers {
	show: (e: MouseEvent, html: string) => void;
	move: (e: MouseEvent) => void;
	hide: () => void;
	wrapperEl: HTMLDivElement | undefined;
}

export type StackedDatum = Record<string, string | number>;

export interface DivergingDatum {
	label: string;
	leftPct: number;
}

export interface BubbleDatum {
	label: string;
	x: number;
	y: number;
	size: number;
	group?: string;
}

export interface PyramidTier {
	label: string;
	left: number;
	right: number;
}

export interface HeatMapCell {
	x: string;
	y: string;
	value: number;
}

export interface StreamDatum {
	[key: string]: string | number;
}

export interface PictogramDatum {
	label: string;
	value: number;
	color?: string;
}

export interface ProportionalDatum {
	label: string;
	value: number;
	color?: string;
}

export interface MekkoDatum {
	label: string;
	/** Total width value (e.g. market size). Determines column width. */
	total: number;
	/** Breakdown values per segment key. Determines vertical proportions. */
	[key: string]: string | number;
}

export interface TreemapNode {
	name: string;
	value?: number;
	children?: TreemapNode[];
}

export interface DonutDatum {
	label: string;
	value: number;
	color?: string;
}

export interface GroupedDatum {
	[key: string]: string | number;
}

export interface ParliamentDatum {
	label: string;
	seats: number;
	color?: string;
}

export interface WaffleDatum {
	label: string;
	value: number;
	color?: string;
}

export interface PieDatum {
	label: string;
	value: number;
	color?: string;
}

export interface CorrelationDatum {
	x: string;
	y: string;
	value: number;
}

export interface CalendarDatum {
	date: string;
	value: number;
}

export interface ContourPoint {
	x: number;
	y: number;
}
