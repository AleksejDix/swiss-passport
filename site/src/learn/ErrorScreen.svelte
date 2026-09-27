<script lang="ts">
  // When the server cannot be reached: say so, and offer the way back to the overview.
  import NextButton from "./NextButton.svelte";
  import { learn } from "./learn.svelte.ts";
</script>

<p class="error" role="alert">{learn.t.error}</p>
<NextButton label={learn.t.overview} onclick={learn.home} />

<style>
  .error {
    color: var(--red);
    margin-top: 0.75rem;
  }
</style>
