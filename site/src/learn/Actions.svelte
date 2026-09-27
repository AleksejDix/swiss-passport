<script lang="ts">
  // A group of ActionButtons, with an optional title: the lessons to choose from, then reviews and the mock exam.
  import type { Snippet } from "svelte";

  interface Props {
    title?: string;
    /** The space above: after a paragraph, or after another group of actions. */
    after?: "text" | "group";
    children: Snippet;
  }

  let { title, after, children }: Props = $props();
</script>

<div class={["actions", after && `after-${after}`]}>
  {#if title}<h2>{title}</h2>{/if}
  {@render children()}
</div>

<style>
  .actions {
    display: grid;
    gap: 0.75rem;
  }
  .after-text {
    margin-top: calc(2 * var(--line));
  }
  .after-group {
    margin-top: var(--line);
  }
  h2 {
    font-size: var(--s);
    line-height: var(--s-lh);
  }
</style>
