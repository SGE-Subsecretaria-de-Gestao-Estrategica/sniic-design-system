import type {
  CategoricalDatum,
  CategoricalLayout,
  CategoricalLayoutConfig,
} from "./types";
import { baseLayout } from "./baseLayout";
import { placeCentered } from "../labels";

/**
 * Categories in drawing order: those in `order` first, as listed, then the
 * rest as they first appear in the data.
 */
function resolveCategories<D>(
  raw: D[],
  getCategory: (d: D) => string,
  order: readonly string[] = [],
): string[] {
  const seen = new Set(order);
  const categories = [...order];
  for (const d of raw) {
    const category = getCategory(d);
    if (seen.has(category)) continue;
    seen.add(category);
    categories.push(category);
  }
  return categories;
}

/** Per UF tile, the index of its category, with the UF name at the centre. */
export function categoricalLayout<D>(
  raw: D[],
  config: CategoricalLayoutConfig<D>,
): CategoricalLayout<D> {
  const { radius, offsetK = 0, getUf, getCategory, categoryOrder } = config;

  const layout = baseLayout(raw, { getUf, radius, offsetK });
  const categories = resolveCategories(raw, getCategory, categoryOrder);
  const indexOf = new Map(categories.map((c, i) => [c, i]));
  const name = placeCentered({ x: 0, y: 0 });

  const data: CategoricalDatum<D>[] = layout.data.map((d) => {
    const category = getCategory(d.data);
    return {
      ...d,
      category,
      categoryIndex: indexOf.get(category)!,
      labels: { name },
    };
  });

  const counts = categories.map(
    (_, i) => data.filter((d) => d.categoryIndex === i).length,
  );

  return {
    tiles: layout.tiles,
    pathData: layout.pathData,
    categories,
    counts,
    emptyLabel: name,
    data,
    width: layout.width,
    height: layout.height,
  };
}
