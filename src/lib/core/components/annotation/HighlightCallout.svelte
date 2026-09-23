<script lang="ts">
  /**
   * A big colored number with a short wrapped sentence under it — the
   * "leia aqui o achado" block that sits in the right-hand gutter of most
   * Eixo 1 print charts (`FaixaLinhasChart`, `CascataChart`,
   * `BarraRankingChart`, `ConcentracaoChart`, `AntesDepoisChart`,
   * `BarraDivergenteChart`, `MatrizBolhasChart`...), each of which had its
   * own copy of this exact layout. Reads top-down from `(x, y)`: the value
   * first, the description wrapped to `width` below it.
   *
   * Not chart-family-specific — no A4 print scale or fixed palette baked
   * in, every size is a prop — so it's meant for Eixo 6, LPG, or any future
   * project's "number + one-sentence explanation" callout too.
   */
  import Text from "../Text.svelte";

  interface Props {
    /** Already formatted — this component doesn't format numbers. */
    value: string;
    description: string;
    /** Fill for `value`; `description` defaults to a softer ink unless overridden. */
    color: string;
    x: number;
    y: number;
    /** Wrap width for `description`. `value` never wraps. */
    width: number;
    valueFontSize?: number;
    descriptionFontSize?: number;
    descriptionColor?: string;
    fontFamily?: string;
    descriptionFontWeight?: string | number;
    /** Vertical gap between the value and the description's first line. Defaults to a size relative to `valueFontSize`. */
    gap?: number;
    lineHeight?: string | number;
  }

  let {
    value,
    description,
    color,
    x,
    y,
    width,
    valueFontSize = 19,
    descriptionFontSize = 13,
    descriptionColor = "#3F3F3B",
    fontFamily,
    descriptionFontWeight = 500,
    gap,
    lineHeight,
  }: Props = $props();

  const resolvedGap = $derived(gap ?? valueFontSize * 0.55);
  const descriptionY = $derived(y + valueFontSize * 1.15 + resolvedGap);
</script>

<Text
  {x}
  {y}
  verticalAnchor="start"
  {fontFamily}
  fontSize={valueFontSize}
  fontWeight={700}
  fill={color}
  text={value}
/>
<Text
  {x}
  y={descriptionY}
  {width}
  verticalAnchor="start"
  {fontFamily}
  fontSize={descriptionFontSize}
  fontWeight={descriptionFontWeight}
  fill={descriptionColor}
  {lineHeight}
  text={description}
/>
