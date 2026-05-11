<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import LineChart from '../lib/components/LineChart.svelte';
  import AnnotationBox from '../lib/components/molecules/AnnotationBox.svelte';
  import { teal, orange, blue, red } from '../lib/tokens.js';

  const { Story } = defineMeta({
    title: 'Molecules/AnnotationBox',
    component: LineChart,
    tags: ['autodocs'],
  });

  function makeSeries(n = 60, seed = 1) {
    let v = 10, s = seed;
    return Array.from({ length: n }, (_, i) => {
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      v += ((Math.abs(s) % 7) - 2.5) * 0.8 + 0.3;
      return { label: String(i + 1), value: +Math.max(0, v).toFixed(1) };
    });
  }

  const data  = makeSeries(60, 1);
  const data2 = makeSeries(60, 7);

  const baseArgs = {
    width: 760,
    height: 380,
    showDots: false,
    smooth: false,
  };
</script>

<Story name="Single Annotation" args={baseArgs}>
  {#snippet children(args)}
    <LineChart series={[{ name: 'Série A', color: teal, data }]} {...args}>
      {#snippet annotations({ xScale, yScale })}
        <AnnotationBox
          pointX={xScale('38') ?? 0}
          pointY={yScale(data[37].value)}
          boxX={(xScale('38') ?? 0) - 280}
          boxY={yScale(data[37].value) - 60}
          title="Title"
          subtitle={"Subtitle with deets and deets\nand deets and deets"}
          color={orange}
        />
      {/snippet}
    </LineChart>
  {/snippet}
</Story>

<Story name="Right-side Box" args={baseArgs}>
  {#snippet children(args)}
    <LineChart series={[{ name: 'Série A', color: teal, data }]} {...args}>
      {#snippet annotations({ xScale, yScale })}
        <AnnotationBox
          pointX={xScale('52') ?? 0}
          pointY={yScale(data[51].value)}
          boxX={(xScale('52') ?? 0) - 240}
          boxY={yScale(data[51].value) - 90}
          title="Pico histórico"
          subtitle={"Maior valor registrado\nno período analisado"}
          color={blue}
          boxWidth={200}
        />
      {/snippet}
    </LineChart>
  {/snippet}
</Story>

<Story name="Multiple Annotations" args={baseArgs}>
  {#snippet children(args)}
    <LineChart series={[{ name: 'Série A', color: teal, data: data2 }]} {...args}>
      {#snippet annotations({ xScale, yScale })}
        <AnnotationBox
          pointX={xScale('18') ?? 0}
          pointY={yScale(data2[17].value)}
          boxX={(xScale('18') ?? 0) + 16}
          boxY={yScale(data2[17].value) - 70}
          title="Início da alta"
          subtitle={"Crescimento\nacelerado"}
          color={orange}
          boxWidth={180}
          circleRadius={14}
        />
        <AnnotationBox
          pointX={xScale('48') ?? 0}
          pointY={yScale(data2[47].value)}
          boxX={(xScale('48') ?? 0) - 210}
          boxY={yScale(data2[47].value) - 80}
          title="Pico registrado"
          subtitle={"Maior valor\ndo período"}
          color={red}
          boxWidth={180}
          circleRadius={14}
        />
      {/snippet}
    </LineChart>
  {/snippet}
</Story>
