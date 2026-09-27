<script lang="ts">
  // Something the learner can open when they want: a square with plus or minus, the label, and what it holds.
  import type { Snippet } from "svelte";

  interface Props {
    label: string;
    /** A detail after the label, in grey: a count. */
    detail?: string;
    children: Snippet;
  }

  let { label, detail, children }: Props = $props();
</script>

<details class="disclosure">
  <summary
    >{label}{#if detail}<span class="detail">{detail}</span>{/if}</summary
  >
  <div class="body">{@render children()}</div>
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
    flex: none;
    width: var(--line);
    height: var(--line);
    display: grid;
    place-items: center;
    border: 1px solid var(--ink);
    font-weight: 400;
    line-height: 1;
  }
  .disclosure[open] summary::before {
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
  .detail {
    font-weight: 400;
    color: var(--grey);
  }
  .body {
    margin-top: var(--line);
  }
</style>
