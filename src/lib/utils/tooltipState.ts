export interface TooltipState {
	visible: boolean;
	x: number;
	y: number;
	html: string;
}

export const TOOLTIP_INITIAL: TooltipState = { visible: false, x: 0, y: 0, html: '' };

/**
 * Computes mouse position relative to a container element.
 */
export function relativePos(
	event: MouseEvent,
	container: HTMLElement,
): { x: number; y: number } {
	const rect = container.getBoundingClientRect();
	return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

/**
 * Creates mouse-event handlers for showing/moving/hiding a tooltip.
 * Returns an object with `onmouseenter`, `onmousemove`, `onmouseleave`
 * that update the provided state setter.
 */
export function tooltipHandlers(
	container: () => HTMLElement | undefined,
	setState: (s: TooltipState) => void,
	htmlFn: (e: MouseEvent) => string,
) {
	return {
		onmouseenter(e: MouseEvent) {
			const el = container();
			if (!el) return;
			setState({ visible: true, ...relativePos(e, el), html: htmlFn(e) });
		},
		onmousemove(e: MouseEvent) {
			const el = container();
			if (!el) return;
			setState({
				visible: true,
				...relativePos(e, el),
				html: '', // will be merged by caller if needed
			});
		},
		onmouseleave() {
			setState({ ...TOOLTIP_INITIAL });
		},
	};
}
