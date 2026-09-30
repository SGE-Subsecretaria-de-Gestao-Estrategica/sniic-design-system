<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";

  type LinearGradientOwnProps = {
    id: string;
    from: string;
    to: string;
    fromOffset?: string | number;
    toOffset?: string | number;
    fromOpacity?: number;
    toOpacity?: number;
    vertical?: boolean;
  };

  let {
    id,
    from,
    to,
    fromOffset = "0%",
    toOffset = "100%",
    fromOpacity = 1,
    toOpacity = 1,
    vertical = true,
    x1 = 0,
    y1 = 0,
    x2 = vertical ? 0 : 1,
    y2 = vertical ? 1 : 0,
    ...rest
  }: LinearGradientOwnProps &
    Omit<
      SVGAttributes<SVGLinearGradientElement>,
      keyof LinearGradientOwnProps
    > = $props();
</script>

<linearGradient {...rest} {id} {x1} {y1} {x2} {y2}>
  <stop offset={fromOffset} stop-color={from} stop-opacity={fromOpacity} />
  <stop offset={toOffset} stop-color={to} stop-opacity={toOpacity} />
</linearGradient>
