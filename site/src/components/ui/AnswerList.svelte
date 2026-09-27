<script lang="ts">
  // The four answers of a question as a list of AnswerRow items, the first without a rule above it.
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
</script>

<ol class="answers">{@render children()}</ol>

<style>
  .answers > :global(:first-child) {
    border-top: 0;
    padding-top: 0;
  }
  /* Answers that show a picture (flags, maps, coats of arms) above their text. */
  .answers :global(img) {
    display: block;
    max-width: 10rem;
    max-height: 8rem;
    margin-bottom: 0.375rem;
  }
</style>
