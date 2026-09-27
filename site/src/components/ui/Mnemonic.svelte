<script lang="ts">
  // A memory aid, or a note on what applies today: set off by a red rule on the left. Its space above comes from where
  // it stands (a paragraph, the prose of a topic, the feedback in /learn).
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
</script>

<p class="mnemonic">{@render children()}</p>

<style>
  .mnemonic {
    border-left: 2px solid var(--red);
    padding-left: 0.75rem;
  }
</style>
