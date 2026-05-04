<script lang="ts">
  import { typography } from '../../tokens.js';

  interface Props {
    text: string;
    x?: number;
    y?: number;
    fontSize?: number;
    color?: string;
    anchor?: 'start' | 'middle' | 'end';
  }

  let {
    text,
    x = 0,
    y = 0,
    fontSize = typography.sizes.md,
    color = '#334155',
    anchor = 'start',
  }: Props = $props();
</script>

<text
  {x}
  {y}
  text-anchor={anchor}
  font-size={fontSize}
  fill={color}
  font-family={typography.fontFamily}
  font-weight="600"
>{text}</text>
