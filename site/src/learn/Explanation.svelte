<script lang="ts">
  // The explanation of the topic, closed: learners try the question first and open it when they want.
  import Disclosure from "./Disclosure.svelte";
  import Mnemonic from "../components/ui/Mnemonic.svelte";
  import type { Concept } from "./api.ts";

  let { concept: c, label }: { concept: Concept; label: string } = $props();
</script>

<Disclosure {label}>
  {#each c.intro as paragraph, i (i)}<p>{paragraph}</p>{/each}
  <dl class="terms-list">
    {#each c.key_terms as k (k.term)}
      <dt lang="de">{k.term}</dt>
      <dd>{k.definition}</dd>
    {/each}
  </dl>
  {#if c.mnemonic}<div class="mnemonic"><Mnemonic>{c.mnemonic}</Mnemonic></div>{/if}
</Disclosure>

<style>
  p + p {
    margin-top: 0.75rem;
  }
  .terms-list {
    margin-top: var(--line);
  }
  dd {
    margin-bottom: 0.75rem;
    color: var(--grey);
  }
  .mnemonic {
    margin-top: var(--line);
  }
</style>
