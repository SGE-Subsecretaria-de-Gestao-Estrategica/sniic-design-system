<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';

  const { Story } = defineMeta({
    title: 'Design System/Typography',
    tags: ['autodocs'],
    parameters: {
      docs: {
        description: {
          component: `
The design system uses **four font families**:

| Token | Font | Stack | Usage |
|---|---|---|---|
| \`fontFamily\` | **Inter** | \`'Inter', system-ui, sans-serif\` | Body text, labels, UI elements |
| \`chartValueFontFamily\` | **Space Grotesk** | \`'Space Grotesk', system-ui, sans-serif\` | Chart values, numeric data, bar labels |
| \`rawlineFontFamily\` | **Rawline** | \`'Rawline', 'Raleway', system-ui, sans-serif\` | Tipografia oficial do Governo Federal |
| \`ralewayFontFamily\` | **Raleway** | \`'Raleway', system-ui, sans-serif\` | Geometric elegante, base da Rawline |

**Inter** is a humanist sans-serif optimized for screen readability.
**Space Grotesk** is a neo-grotesque geometric sans-serif for numeric data.
**Rawline** is the official Brazilian Federal Government typeface (Raleway with lining figures).
**Raleway** is the elegant geometric sans-serif that serves as Rawline's base.
          `.trim(),
        },
      },
    },
  });

  const fonts = [
    { name: 'Inter', token: 'fontFamily', family: "'Inter', system-ui, sans-serif", desc: 'Body text, labels, UI elements' },
    { name: 'Space Grotesk', token: 'chartValueFontFamily', family: "'Space Grotesk', system-ui, sans-serif", desc: 'Chart values, numeric data, bar labels' },
    { name: 'Rawline', token: 'rawlineFontFamily', family: "'Rawline', 'Raleway', system-ui, sans-serif", desc: 'Tipografia oficial do Governo Federal' },
    { name: 'Raleway', token: 'ralewayFontFamily', family: "'Raleway', system-ui, sans-serif", desc: 'Geometric elegante, base da Rawline' },
  ];

  const sampleText = 'Dados culturais do Brasil';
  const sampleNumbers = '0123456789';
  const sampleParagraph =
    'O Sistema Nacional de Informações e Indicadores Culturais reúne dados sobre equipamentos, agentes e políticas culturais em todo o território brasileiro.';

  const sizes = [
    { label: 'xs', size: 10 },
    { label: 'sm', size: 12 },
    { label: 'md', size: 14 },
    { label: 'lg', size: 16 },
    { label: 'xl', size: 20 },
    { label: '2xl', size: 24 },
    { label: '3xl', size: 32 },
    { label: '4xl', size: 48 },
  ];

  const weights = [
    { label: 'Regular', weight: 400 },
    { label: 'Medium', weight: 500 },
    { label: 'Semi Bold', weight: 600 },
    { label: 'Bold', weight: 700 },
  ];

  const LIGHT = { fg: '#111', muted: '#6b7280', accent: '#4271b5', border: '#e5e7eb', tagBg: '#f3f4f6' };
  const DARK = { fg: '#f3f4f6', muted: '#9ca3af', accent: '#7ba6d9', border: '#374151', tagBg: '#1f2937' };

  function adaptColors(node: HTMLElement) {
    function update() {
      let el: HTMLElement | null = node;
      while (el) {
        const bg = getComputedStyle(el).backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
          const m = bg.match(/[\d.]+/g);
          if (m) {
            const [r, g, b] = m.map(Number);
            const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            const t = lum < 0.5 ? DARK : LIGHT;
            node.style.setProperty('--fg', t.fg);
            node.style.setProperty('--fg-muted', t.muted);
            node.style.setProperty('--fg-accent', t.accent);
            node.style.setProperty('--border', t.border);
            node.style.setProperty('--tag-bg', t.tagBg);
            return;
          }
        }
        el = el.parentElement;
      }
      const t = LIGHT;
      node.style.setProperty('--fg', t.fg);
      node.style.setProperty('--fg-muted', t.muted);
      node.style.setProperty('--fg-accent', t.accent);
      node.style.setProperty('--border', t.border);
      node.style.setProperty('--tag-bg', t.tagBg);
    }

    update();
    const observer = new MutationObserver(update);
    observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['style', 'class'] });
    return { destroy() { observer.disconnect(); } };
  }
</script>

<Story name="Font Families">
  <div use:adaptColors>
    <div class="type-grid">
      {#each fonts as font (font.name)}
        <section>
          <h3 class="section-title">{font.name} <span class="token">{font.token}</span></h3>
          <p class="section-desc">{font.desc}</p>
          <div style="font-family: {font.family}">
            <p class="display">{sampleText}</p>
            <p class="numbers">{sampleNumbers}</p>
            <p class="body">{sampleParagraph}</p>
          </div>
        </section>
      {/each}
    </div>
  </div>

  <style>
    .type-grid {
      display: flex;
      flex-direction: column;
      gap: 40px;
      max-width: 720px;
      color: var(--fg);
    }
    section {
      border-bottom: 1px solid var(--border);
      padding-bottom: 32px;
    }
    .section-title {
      margin: 0 0 4px;
      font-size: 14px;
      font-weight: 600;
    }
    .token {
      font-weight: 400;
      font-size: 12px;
      color: var(--fg-muted);
      background: var(--tag-bg);
      padding: 2px 6px;
      border-radius: 4px;
      margin-left: 8px;
    }
    .section-desc {
      margin: 0 0 16px;
      font-size: 12px;
      color: var(--fg-muted);
    }
    .display {
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 8px;
    }
    .numbers {
      font-size: 48px;
      font-weight: 700;
      margin: 0 0 12px;
      color: var(--fg-accent);
      letter-spacing: 0.02em;
    }
    .body {
      font-size: 14px;
      font-weight: 400;
      line-height: 1.6;
      margin: 0;
      color: var(--fg-muted);
    }
  </style>
</Story>

<Story name="Sizes">
  <div use:adaptColors>
    <div class="sizes-grid">
      {#each sizes as { label, size } (label)}
        <div class="size-row">
          <span class="size-label">{label} — {size}px</span>
          {#each fonts as font (font.name)}
            <span class="size-sample" style="font-family: {font.family}; font-size: {size}px">
              {font.name}: {sampleText}
            </span>
          {/each}
        </div>
      {/each}
    </div>
  </div>

  <style>
    .sizes-grid {
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 720px;
      color: var(--fg);
    }
    .size-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 16px;
    }
    .size-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--fg-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
    }
    .size-sample {
      color: var(--fg);
    }
  </style>
</Story>

<Story name="Weights">
  <div use:adaptColors>
    <div class="weights-grid">
      {#each weights as { label, weight } (label)}
        <div class="weight-row">
          <span class="weight-label">{label} ({weight})</span>
          <div class="weight-samples">
            {#each fonts as font (font.name)}
              <span class="weight-sample" style="font-family: {font.family}; font-weight: {weight}">
                {font.name}: {sampleText}
              </span>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>

  <style>
    .weights-grid {
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 720px;
      color: var(--fg);
    }
    .weight-row {
      border-bottom: 1px solid var(--border);
      padding-bottom: 16px;
    }
    .weight-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--fg-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: block;
      margin-bottom: 8px;
    }
    .weight-samples {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .weight-sample {
      font-size: 20px;
      color: var(--fg);
    }
  </style>
</Story>

<Story name="Italic">
  <div use:adaptColors>
    <div class="italic-grid">
      {#each fonts as font (font.name)}
        <div class="italic-row">
          <span class="italic-label">{font.name}</span>
          <div class="italic-samples">
            <span style="font-family: {font.family}; font-style: normal; font-weight: 400">
              Regular: {sampleText}
            </span>
            <span style="font-family: {font.family}; font-style: italic; font-weight: 400">
              Italic: {sampleText}
            </span>
            <span style="font-family: {font.family}; font-style: normal; font-weight: 700">
              Bold: {sampleText}
            </span>
            <span style="font-family: {font.family}; font-style: italic; font-weight: 700">
              Bold Italic: {sampleText}
            </span>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <style>
    .italic-grid {
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 720px;
      color: var(--fg);
    }
    .italic-row {
      border-bottom: 1px solid var(--border);
      padding-bottom: 20px;
    }
    .italic-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--fg-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: block;
      margin-bottom: 8px;
    }
    .italic-samples {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 20px;
    }
  </style>
</Story>
