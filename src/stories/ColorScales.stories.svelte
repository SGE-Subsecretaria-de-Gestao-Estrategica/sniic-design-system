<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ColorPalette from '../lib/components/ColorPalette.svelte';

  const { Story } = defineMeta({
    title: 'Design System/Color Scales',
    component: ColorPalette,
    tags: ['autodocs'],
    parameters: {
      docs: {
        description: {
          component: `
The design system has **8 color families**, each with 5 stops (100 → 900).
All stops shift hue slightly across the ramp for richer visual transitions.

| Token | Hex (500) | Role |
|---|---|---|
| \`blue\` | \`#4271b5\` | Primary — default for main data series and UI chrome |
| \`orange\` | \`#ea662f\` | Accent — pairs with blue as the default second series |
| \`teal\` | \`#265c4f\` | Environmental / health — deep, nature-forward |
| \`yellow\` | \`#f6c341\` | Highlight / warning — draws attention to single values |
| \`purple\` | \`#a44c7f\` | Demographic splits — categorical distinction alongside blue |
| \`lime\` | \`#81a72f\` | Positive / growth — intuitive for upward or healthy indicators |
| \`red\` | \`#cb4034\` | Alert / negative — warnings, errors, decline |
| \`lavender\` | \`#c9b6c5\` | Neutral / muted — secondary categories, annotation backgrounds |
          `.trim(),
        },
      },
    },
    argTypes: {
      background: {
        control: 'radio',
        options: ['light', 'dark'],
        description: 'Preview background to verify legibility in both contexts.',
      },
      view: {
        control: 'radio',
        options: ['swatches', 'gradients', 'cross'],
        description: 'Swatches shows individual stops; gradients shows continuous scale transitions; cross shows all color-to-color gradient combinations.',
      },
    },
  });
</script>

<Story
  name="Swatches"
  args={{ view: 'swatches', background: 'light' }}
  parameters={{
    docs: {
      description: {
        story: `
Each scale shows 5 stops (100–900). Use **500** as the base identity color,
**300/700** for hover or secondary emphasis, **100** for backgrounds, and **900** for maximum contrast.
The stop label inside each swatch automatically adapts to black or white for legibility.
        `.trim(),
      },
    },
  }}
/>

<Story name="Swatches Dark" args={{ view: 'swatches', background: 'dark' }} />

<Story
  name="Gradients"
  args={{ view: 'gradients', background: 'light' }}
  parameters={{
    docs: {
      description: {
        story: `
Continuous ramp of each scale across all 5 stops.
Use these as the \`colorRange\` prop in **ChoroplethMap** and **HeatMap** for sequential encoding.
The intentional hue shift across stops (e.g. blue 212° → 228°) produces richer visual transitions than a flat single-hue ramp.
        `.trim(),
      },
    },
  }}
/>

<Story name="Gradients Dark" args={{ view: 'gradients', background: 'dark' }} />

<Story
  name="Cross-color"
  args={{ view: 'cross', background: 'light' }}
  parameters={{
    docs: {
      description: {
        story: `
All 64 color-to-color combinations from the palette. The **diagonal** shows each scale's own full range (100 → 900).
Off-diagonal cells show a 2-stop gradient between the midpoint (500) of each pair.
Cells outlined in yellow are the **8 recommended pairings**, shown in detail below the matrix.

**Avoid**
- Red + Orange (too similar in hue, indistinguishable for colorblind users)
- Lime + Yellow (insufficient luminance contrast)
- Lavender + Purple (too close in chroma and hue)
        `.trim(),
      },
    },
  }}
/>

<Story name="Cross-color Dark" args={{ view: 'cross', background: 'dark' }} />
