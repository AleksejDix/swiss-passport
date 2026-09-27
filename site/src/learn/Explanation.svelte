<script lang="ts">
  // The explanation of the topic, closed: learners try the question first and open it when they want.
  import Mnemonic from "./Mnemonic.svelte";
  import type { Concept } from "./api.ts";

  let { concept: c, label }: { concept: Concept; label: string } = $props();
</script>

<details class="explain">
  <summary>{label}</summary>
  <div class="explain-body">
    {#each c.intro as paragraph, i (i)}<p>{paragraph}</p>{/each}
    <dl class="terms-list">
      {#each c.key_terms as k (k.term)}
        <dt lang="de">{k.term}</dt>
        <dd>{k.definition}</dd>
      {/each}
    </dl>
    {#if c.mnemonic}<Mnemonic>{c.mnemonic}</Mnemonic>{/if}
  </div>
</details>

<style>
  summary {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    list-style: none;
  }
  summary::-webkit-details-marker {
    display: none;
  }
  summary::before {
    content: "+";
    width: var(--line);
    height: var(--line);
    display: grid;
    place-items: center;
    border: 1px solid var(--ink);
    font-weight: 400;
    line-height: 1;
  }
  .explain[open] summary::before {
    content: "\2212";
    background: var(--ink);
    color: var(--paper);
  }
  summary:hover {
    color: var(--red);
  }
  summary:hover::before {
    border-color: var(--red);
  }
  .explain-body {
    margin-top: var(--line);
  }
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
</style>
