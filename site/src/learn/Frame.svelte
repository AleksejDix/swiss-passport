<script lang="ts">
  // Every screen of /learn uses the same frame: a head, then two columns on large screens. Right: what you act on
  // (the question, the buttons). Left: information (explanation, progress). On phones the right part comes first.
  import type { Snippet } from "svelte";

  interface Props {
    head: Snippet;
    act: Snippet;
    info: Snippet;
    /** Under the step head, whose progress bar already draws the rule. */
    step?: boolean;
  }

  let { head, act, info, step = false }: Props = $props();
</script>

{@render head()}
<div class={["cols", { step }]}>
  <section class="act">{@render act()}</section>
  <aside class="info">{@render info()}</aside>
</div>

<style>
  .cols {
    display: grid;
    grid-template-columns: var(--grid);
    column-gap: var(--gutter);
    row-gap: calc(2 * var(--line));
    border-top: 1px solid var(--ink);
    padding-top: calc(var(--line) - 1px);
  }
  .cols.step {
    border-top: 0;
    padding-top: var(--line);
  }
  .act,
  .info {
    grid-column: 1 / -1;
    min-width: 0;
  }
  .info {
    border-top: 1px solid var(--ink);
    padding-top: calc(var(--line) - 1px);
  }
  @media (min-width: 40rem) {
    .act,
    .info {
      grid-column: 1 / span 6;
    }
  }
  @media (min-width: 64rem) {
    .act,
    .info {
      grid-row: 1;
    }
    .info {
      grid-column: 1 / span 5;
      border-top: 0;
      padding-top: 0;
    }
    .act {
      grid-column: 7 / span 6;
      position: sticky;
      top: var(--line);
      align-self: start;
    }
  }
</style>
