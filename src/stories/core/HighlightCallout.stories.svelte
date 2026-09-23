<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Svg from "$lib/core/components/Svg.svelte";
  import HighlightCallout from "$lib/core/components/annotation/HighlightCallout.svelte";

  const { Story } = defineMeta({
    title: "Core/HighlightCallout",
    component: HighlightCallout,
    argTypes: {
      value: { control: "text" },
      description: { control: "text" },
      color: { control: "color" },
      valueFontSize: { control: "number" },
      descriptionFontSize: { control: "number" },
    },
    args: {
      value: "68%",
      description:
        "dos municípios brasileiros possuem lei de incentivo à cultura em vigor.",
      color: "#D5362A",
      valueFontSize: 19,
      descriptionFontSize: 13,
    },
  });
</script>

<!--
  The "leia aqui o achado" gutter block duplicated by hand across most
  Eixo 1 charts: a big colored value, then a short wrapped sentence below
  it. Any size is a prop, so it's not tied to the A4 print scale those
  charts use.
-->
<Story name="Default">
  {#snippet template(args)}
    <Svg width={260} height={140} style="border: 1px solid #eee;">
      <HighlightCallout {...args} x={16} y={20} width={220} />
    </Svg>
  {/snippet}
</Story>

<Story name="Long description">
  {#snippet template(args)}
    <Svg width={220} height={220} style="border: 1px solid #eee;">
      <HighlightCallout
        {...args}
        description="das bibliotecas municipais não possuem acervo digital nem catálogo online disponível para consulta remota pela população."
        x={16}
        y={20}
        width={188}
      />
    </Svg>
  {/snippet}
</Story>
