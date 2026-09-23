<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Svg from "$lib/core/components/Svg.svelte";
  import RoundedBar from "$lib/core/components/shape/RoundedBar.svelte";

  const { Story } = defineMeta({
    title: "Core/RoundedBar",
    component: RoundedBar,
    tags: [],
  });
</script>

<!--
  What `Bar` (a plain `<rect rx>`) can't do: round only some corners. The
  two cases that come up in charts are a stacked-column segment (only the
  top rounds, so it sits flush with the segment below) and a pill (both
  ends fully rounded, radius = half the height).
-->
<Story name="Stacked segment corners">
  {#snippet template()}
    <Svg width={360} height={220} style="border: 1px solid #eee;">
      <RoundedBar
        x={40}
        y={30}
        width={80}
        height={70}
        radius={10}
        corners={{ topLeft: true, topRight: true }}
        fill="#D5362A"
      />
      <RoundedBar x={40} y={100} width={80} height={90} radius={10} fill="#4B2F92" />

      <RoundedBar
        x={160}
        y={60}
        width={80}
        height={40}
        radius={10}
        corners={{ topLeft: true, topRight: true }}
        fill="#D5362A"
      />
      <RoundedBar x={160} y={100} width={80} height={50} radius={10} fill="#EC6596" />
      <RoundedBar
        x={160}
        y={150}
        width={80}
        height={40}
        radius={10}
        corners={{ bottomLeft: true, bottomRight: true }}
        fill="#4B2F92"
      />
    </Svg>
  {/snippet}
</Story>

<Story name="Pill">
  {#snippet template()}
    <Svg width={360} height={100} style="border: 1px solid #eee;">
      <RoundedBar x={30} y={30} width={140} height={28} radius={14} fill="#68CF27" />
      <RoundedBar
        x={190}
        y={30}
        width={60}
        height={28}
        radius={14}
        corners={{ topLeft: true, bottomLeft: true }}
        fill="#4F68DA"
      />
    </Svg>
  {/snippet}
</Story>
