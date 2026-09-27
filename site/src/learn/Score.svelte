<script lang="ts">
  // The result of a round, set as large as the headline of the homepage: 7/9, 41/50.
  let { value }: { value: string } = $props();
</script>

<p class="score">{value}</p>

<style>
  .score {
    font-size: var(--xxl);
    line-height: 0.94;
    font-weight: 700;
    letter-spacing: var(--xxl-track);
    margin-inline-start: -0.035em;
    font-variant-numeric: tabular-nums;
  }
  .score + :global(p) {
    margin-top: 0.75rem;
  }
</style>
