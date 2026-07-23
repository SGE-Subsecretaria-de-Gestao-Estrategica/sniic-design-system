import SvgExportDecorator from '../src/lib/storybook/SvgExportDecorator.svelte';
import ThemeDecorator from '../src/lib/storybook/ThemeDecorator.svelte';

import "../src/app.css"

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
        cream: { name: 'cream', value: '#fffde6' },
        dark: { name: 'dark', value: '#000000ff' },
        blue: { name: 'blue', value: '#4271b5' },
        orange: { name: 'orange', value: '#ea662f' },
        teal: { name: 'teal', value: '#265c4f' },
        yellow: { name: 'yellow', value: '#f6c341' },
        purple: { name: 'purple', value: '#a44c7f' },
        lime: { name: 'lime', value: '#81a72f' },
        red: { name: 'red', value: '#cb4034' },
        lavender: { name: 'lavender', value: '#c9b6c5' },
        white: { name: 'white', value: '#fffffe' },
        'light-blue': { name: 'light blue', value: '#d5e4f7' },
        'light-orange': { name: 'light orange', value: '#fde9d4' },
        'light-teal': { name: 'light teal', value: '#cce8e3' },
        'light-yellow': { name: 'light yellow', value: '#fef6cc' },
        'light-purple': { name: 'light purple', value: '#f0d8ec' },
        'light-lime': { name: 'light lime', value: '#e7f5c4' },
        'light-red': { name: 'light red', value: '#fbe8e5' },
        'light-lavender': { name: 'light lavender', value: '#f4eff3' },
      },
    },
    a11y: {
      test: 'todo',
    },
    options: {
      storySort: {
        order: ['Design System', 'Atoms', 'Molecules', 'Charts'],
      },
    },
  },
  initialGlobals: {
    backgrounds: { value: 'light' },
  },
  decorators: [
    // Sets CSS custom properties (--chart-fg, --chart-grid, etc.) based on the
    // active Storybook background, so chart foreground elements adapt automatically.
    (_, { globals }) => ({ Component: ThemeDecorator, props: { globals } }),
    // Wraps every story with an "Export SVG" button that serialises the
    // first <svg> found in the rendered story and downloads it as a file.
    () => ({ Component: SvgExportDecorator }),
  ],
};

export default preview;
