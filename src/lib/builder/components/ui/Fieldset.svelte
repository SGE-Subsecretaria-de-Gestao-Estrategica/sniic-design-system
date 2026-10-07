<script lang="ts">
  import type { Snippet } from "svelte";
  import "./tokens.css";

  let { legend, children }: { legend: string; children: Snippet } = $props();
</script>

<fieldset>
  <legend>{legend}</legend>
  <div class="content">
    {@render children()}
  </div>
</fieldset>

<style>
  fieldset {
    min-width: 0;
    margin: 0;
    padding: 16px 0 0;
    font-family: var(--builder-font);
    border: 0;
    border-top: 1px solid var(--builder-line-soft);
  }
  legend {
    float: left;
    width: 100%;
    margin: 0 0 12px;
    padding: 0;
    color: var(--builder-ink-strong);
    font-size: var(--builder-text);
    font-weight: 600;
  }
  .content {
    display: flex;
    flex-direction: column;
    gap: 12px;
    clear: both;
  }
</style>
