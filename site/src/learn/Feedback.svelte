<script lang="ts">
  // After an answer, in the information column: why the right answer is right, why the chosen one is not, what applies
  // today where the official answer is outdated, and the source.
  import Mnemonic from "./Mnemonic.svelte";
  import type { Feedback } from "./api.ts";

  let { feedback: f, sourceLabel }: { feedback: Feedback; sourceLabel: string } = $props();
  const host = (href: string) => new URL(href).hostname.replace(/^www\./, "");
</script>

<section class="feedback">
  <p>{f.why}</p>
  {#if f.about_your_answer}<p>{f.about_your_answer}</p>{/if}
  {#if f.note}<Mnemonic>{f.note}</Mnemonic>{/if}
  {#if f.sources?.[0]}
    <p class="src">{sourceLabel}: <a href={f.sources[0]} target="_blank" rel="noopener">{host(f.sources[0])}</a></p>
  {/if}
</section>

<style>
  .feedback {
    margin-bottom: var(--line);
  }
  p + p {
    margin-top: 0.75rem;
  }
  .src {
    font-size: var(--xs);
    line-height: var(--xs-lh);
    letter-spacing: 0;
    color: var(--grey);
    margin-top: 0.75rem;
  }
</style>
