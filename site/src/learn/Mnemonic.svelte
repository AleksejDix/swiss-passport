<script lang="ts">
  // A memory aid, or a note on what applies today: set off by a red rule on the left.
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
</script>

<p class="mnemonic">{@render children()}</p>

<style>
  .mnemonic {
    border-left: 2px solid var(--red);
    padding-left: 0.75rem;
    margin-top: var(--line);
  }
</style>
