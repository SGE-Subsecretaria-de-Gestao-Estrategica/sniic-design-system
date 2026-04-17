export function showTooltip(el: HTMLElement, html: string): void {
  el.innerHTML = html;
  el.style.display = 'block';
}

export function positionTooltip(
  el: HTMLElement,
  mx: number,
  my: number,
  offsetX = 12,
  offsetY = -24,
): void {
  el.style.left = `${mx + offsetX}px`;
  el.style.top = `${my + offsetY}px`;
}

export function hideTooltip(el: HTMLElement): void {
  el.style.display = 'none';
}
