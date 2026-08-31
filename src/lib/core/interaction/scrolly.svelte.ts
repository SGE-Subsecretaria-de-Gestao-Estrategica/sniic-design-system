/**
 * Minimal scrollytelling driver.
 *
 * The charts themselves are *controlled*: they take a `step` number and render
 * that stage. Which step is active is the host page's business, so this file is
 * optional — bring your own scroll library and just set `step` if you prefer.
 * What is here covers the common case without adding a dependency.
 *
 * ```svelte
 * <script>
 *   import { ScrollySteps, scrollStep, InformalidadeChart } from 'sniic-design-system';
 *   const scrolly = new ScrollySteps();
 * </script>
 *
 * <div class="sticky"><InformalidadeChart {data} step={scrolly.step} /></div>
 * {#each copy as text, i}
 *   <section use:scrollStep={{ scrolly, index: i }}>{text}</section>
 * {/each}
 * ```
 */

export type ScrollyOptions = {
	/**
	 * Where in the viewport a step becomes active, as a fraction of viewport
	 * height from the top. 0.5 (the default) trips a step when it crosses the
	 * middle of the screen, which is where a sticky graphic usually sits.
	 */
	offset?: number;
	/** Step reported before the first section has been reached. */
	initialStep?: number;
};

export class ScrollySteps {
	/** Index of the active step; `initialStep` until a section crosses the line. */
	step = $state(0);
	/**
	 * Progress through the active step, 0 at its start and 1 at its end. Useful
	 * for continuous effects; stage-based charts only need `step`.
	 */
	progress = $state(0);

	readonly offset: number;

	#entries = new Map<Element, number>();
	#observer: IntersectionObserver | null = null;
	#onScroll: (() => void) | null = null;

	constructor(options: ScrollyOptions = {}) {
		this.offset = options.offset ?? 0.5;
		this.step = options.initialStep ?? 0;
	}

	/** Registers a section element as step `index`. Returns a teardown function. */
	register(el: Element, index: number) {
		this.#entries.set(el, index);
		this.#ensureObserver();
		this.#observer?.observe(el);

		return () => {
			this.#observer?.unobserve(el);
			this.#entries.delete(el);
			if (this.#entries.size === 0) this.destroy();
		};
	}

	destroy() {
		this.#observer?.disconnect();
		this.#observer = null;
		if (this.#onScroll) {
			window.removeEventListener('scroll', this.#onScroll);
			this.#onScroll = null;
		}
		this.#entries.clear();
	}

	#ensureObserver() {
		if (this.#observer || typeof IntersectionObserver === 'undefined') return;

		// A zero-height band across the viewport at `offset`: an element is
		// "active" exactly while that line is inside it.
		const top = this.offset * 100;
		this.#observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting) continue;
					const index = this.#entries.get(entry.target);
					if (index !== undefined) this.step = index;
				}
			},
			{ rootMargin: `-${top}% 0px -${100 - top}% 0px`, threshold: 0 }
		);

		this.#onScroll = () => this.#updateProgress();
		window.addEventListener('scroll', this.#onScroll, { passive: true });
	}

	#updateProgress() {
		const active = [...this.#entries].find(([, index]) => index === this.step)?.[0];
		if (!active) return;

		const rect = active.getBoundingClientRect();
		if (rect.height === 0) return;

		const line = window.innerHeight * this.offset;
		this.progress = Math.min(1, Math.max(0, (line - rect.top) / rect.height));
	}
}

/**
 * Svelte action pairing a section element with a step index.
 * `use:scrollStep={{ scrolly, index }}`
 */
export function scrollStep(node: Element, params: { scrolly: ScrollySteps; index: number }) {
	let teardown = params.scrolly.register(node, params.index);

	return {
		update(next: { scrolly: ScrollySteps; index: number }) {
			teardown();
			teardown = next.scrolly.register(node, next.index);
		},
		destroy() {
			teardown();
		}
	};
}
