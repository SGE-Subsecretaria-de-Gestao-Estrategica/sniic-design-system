import SvgExportDecorator from '../src/lib/storybook/SvgExportDecorator.svelte';

/** @type { import('@storybook/svelte-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      options: {
        light: { name: 'light', value: '#ffffdeff' },
        dark: { name: 'dark', value: '#000000ff' },
      },
    },
    a11y: {
      test: 'todo',
    },
  },
  initialGlobals: {
    backgrounds: { value: 'light' },
  },
  decorators: [
    // Wraps every story with an "Export SVG" button that serialises the
    // first <svg> found in the rendered story and downloads it as a file.
    () => ({ Component: SvgExportDecorator }),
  ],
};

export default preview;
