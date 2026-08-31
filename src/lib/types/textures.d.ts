declare module 'textures' {
  export interface Texture {
    /** Call signature allowing usage with D3's `.call(texture)` */
    <T extends SVGElement | SvgElementLike>(selection: SelectionLike<T> | T): void;

    id(): string;
    id(id: string): this;

    background(): string;
    background(color: string): this;

    size(): number;
    size(size: number): this;

    fill(): string;
    fill(color: string): this;

    stroke(): string;
    stroke(color: string): this;

    strokeWidth(): number;
    strokeWidth(width: number): this;

    heavier(padding?: number): this;
    thinner(padding?: number): this;

    url(): string;
  }

  export interface LinesTexture extends Texture {
    orientation(...orientations: string[]): this;
    shapeRendering(): string;
    shapeRendering(mode: string): this;
    thicker(): this;
  }

  export interface CirclesTexture extends Texture {
    radius(): number;
    radius(r: number): this;
    complement(flag?: boolean): this;
  }

  export interface PathsTexture extends Texture {
    d(): string | ((t: PathsTexture) => string);
    d(path: string | ((t: PathsTexture) => string)): this;
    shapeRendering(): string;
    shapeRendering(mode: string): this;
  }

  export function lines(): LinesTexture;
  export function circles(): CirclesTexture;
  export function paths(): PathsTexture;

  interface Textures {
    lines: typeof lines;
    circles: typeof circles;
    paths: typeof paths;
  }

  // Fallback interfaces for basic D3 selection compatibility without requiring @types/d3
  interface SvgElementLike {
    appendChild(node: Node): Node;
  }

  interface SelectionLike<T> {
    append(name: string): SelectionLike<T>;
    attr(name: string, value: any): SelectionLike<T>;
    each(fn: (this: T) => void): SelectionLike<T>;
  }

  const textures: Textures;
  export default textures;
}