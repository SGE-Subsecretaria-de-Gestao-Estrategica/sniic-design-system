import { embeddedFontCss } from "./fonts";
import { svgMarkup } from "./svg";

/** The chart as a PNG, `scale` pixels per figure pixel, on a transparent background. */
export async function pngBlob(svg: SVGSVGElement, scale = 1): Promise<Blob> {
  const width = svg.width.baseVal.value;
  const height = svg.height.baseVal.value;
  const markup = svgMarkup(svg, await embeddedFontCss(svg));
  const url = URL.createObjectURL(
    new Blob([markup], { type: "image/svg+xml;charset=utf-8" }),
  );
  try {
    const image = new Image();
    image.src = url;
    await image.decode();

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas 2D is not available.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return await new Promise((resolve, reject) =>
      canvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error("PNG encoding failed.")),
        "image/png",
      ),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}
