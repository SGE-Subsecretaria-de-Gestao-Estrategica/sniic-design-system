<script lang="ts">
  import { moveItem } from "../../registry/options";
  import Button from "../ui/Button.svelte";

  type Props = {
    label: string;
    /** The order on screen, read from the layout. */
    order: readonly string[];
    onchange: (order: string[]) => void;
  };

  let { label, order, onchange }: Props = $props();
</script>

<fieldset>
  <legend>{label}</legend>
  <ol>
    {#each order as name, i (name)}
      <li>
        <span class="position">{i + 1}</span>
        <span class="name">{name}</span>
        <Button
          variant="icon"
          aria-label="Subir {name}"
          disabled={i === 0}
          onclick={() => onchange(moveItem(order, i, -1))}>↑</Button
        >
        <Button
          variant="icon"
          aria-label="Descer {name}"
          disabled={i === order.length - 1}
          onclick={() => onchange(moveItem(order, i, 1))}>↓</Button
        >
      </li>
    {/each}
  </ol>
</fieldset>

<style>
  fieldset {
    min-width: 0;
    margin: 0;
    padding: 0;
    font-family: var(--builder-font);
    border: 0;
  }
  legend {
    margin-bottom: 6px;
    padding: 0;
    color: var(--builder-ink);
    font-size: var(--builder-text-sm);
    font-weight: 500;
  }
  ol {
    max-height: 280px;
    margin: 0;
    padding: 0;
    overflow: auto;
    list-style: none;
    background: var(--builder-surface);
    border: 1px solid var(--builder-line);
    border-radius: var(--builder-radius);
  }
  li {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 4px 6px 4px 10px;
    color: var(--builder-ink);
    font-size: var(--builder-text-sm);
  }
  li + li {
    border-top: 1px solid var(--builder-line-soft);
  }
  .position {
    width: 18px;
    color: var(--builder-faint);
    font-variant-numeric: tabular-nums;
  }
  .name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
