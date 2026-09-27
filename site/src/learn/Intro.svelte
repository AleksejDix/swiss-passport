<script lang="ts">
  // The head of the overview and of the results: the title, and on the overview the lead, as on every other page.
  interface Props {
    title: string;
    lede?: string;
    note?: string;
  }

  let { title, lede, note }: Props = $props();
</script>

<div class="intro">
  <h1>{title}</h1>
  {#if lede}<p class="lede">{lede}</p>{/if}
  {#if note}<p class="note">{note}</p>{/if}
</div>

<style>
  .intro {
    display: grid;
    grid-template-columns: var(--grid);
    column-gap: var(--gutter);
    padding-bottom: calc(3 * var(--line));
  }
  .intro > * {
    grid-column: 1 / -1;
  }
  .lede {
    margin-top: calc(2 * var(--line));
  }
  @media (min-width: 40rem) {
    .lede,
    .note {
      grid-column: 1 / span 6;
    }
  }
  @media (min-width: 64rem) {
    .lede,
    .note {
      grid-column: 4 / span 6;
    }
  }
</style>
