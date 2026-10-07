<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";
  import "./tokens.css";

  type Props = Omit<HTMLInputAttributes, "type"> & { children: Snippet };

  let { checked, children, ...rest }: Props = $props();
</script>

<label>
  <input type="checkbox" {checked} {...rest} />
  <span>{@render children()}</span>
</label>

<style>
  label {
    display: flex;
    gap: 8px;
    align-items: center;
    color: var(--builder-ink);
    font: 400 var(--builder-text) / 1.3 var(--builder-font);
    cursor: pointer;
  }
  input {
    appearance: none;
    flex: none;
    box-sizing: border-box;
    width: 18px;
    height: 18px;
    margin: 0;
    background: var(--builder-surface) center / 12px no-repeat;
    border: 1px solid var(--builder-faint);
    border-radius: 3px;
    cursor: pointer;
  }
  input:checked {
    background-color: var(--builder-ink);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23FEFFFC' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m2.5 6.2 2.4 2.4 4.6-5'/%3E%3C/svg%3E");
    border-color: var(--builder-ink);
  }
  input:focus-visible {
    outline: 2px solid var(--builder-ink-strong);
    outline-offset: 2px;
  }
</style>
