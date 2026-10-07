function fontFamilies(svg: SVGSVGElement): Set<string> {
  const families = new Set<string>();
  for (const el of svg.querySelectorAll("[font-family]")) {
    for (const name of (el.getAttribute("font-family") ?? "").split(",")) {
      families.add(name.trim().replace(/^["']|["']$/g, ""));
    }
  }
  return families;
}

function fontFaceRules(families: Set<string>): CSSFontFaceRule[] {
  const rules: CSSFontFaceRule[] = [];
  for (const sheet of document.styleSheets) {
    let cssRules: CSSRuleList;
    try {
      cssRules = sheet.cssRules;
    } catch {
      // A stylesheet from another origin can't be read.
      continue;
    }
    for (const rule of cssRules) {
      if (!(rule instanceof CSSFontFaceRule)) continue;
      const family = rule.style
        .getPropertyValue("font-family")
        .replace(/^["']|["']$/g, "");
      if (families.has(family)) rules.push(rule);
    }
  }
  return rules;
}

function dataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * `@font-face` rules for the fonts the chart uses, with each font file
 * inside the rule. An SVG drawn as an image can't reach the page's fonts, so
 * a PNG needs them inside the SVG. A font that can't be fetched is left out.
 */
export async function embeddedFontCss(svg: SVGSVGElement): Promise<string> {
  const rules = fontFaceRules(fontFamilies(svg));
  const embedded = await Promise.all(
    rules.map(async (rule) => {
      const src = rule.style.getPropertyValue("src");
      const url = src.match(/url\(\s*["']?([^"')]+)["']?\s*\)/)?.[1];
      if (!url) return "";
      try {
        const base = rule.parentStyleSheet?.href ?? document.baseURI;
        const response = await fetch(new URL(url, base));
        if (!response.ok) return "";
        const data = await dataUrl(await response.blob());
        return rule.cssText.replace(src, `url("${data}")`);
      } catch {
        return "";
      }
    }),
  );
  return embedded.join("\n");
}
