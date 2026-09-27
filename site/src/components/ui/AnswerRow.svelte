<script lang="ts">
  // One answer of a question: the letter in a square, then the answer. The same row on the question pages, the method
  // page and in /learn. A static item (li) shows the right answer; a button reacts to the pointer and takes the states
  // chosen, is-right and is-wrong (from its props in /learn, or set by scripts/method-viz.js on the method page).
  import type { Snippet } from "svelte";

  interface Props {
    letter: string;
    as?: "li" | "button";
    /** Marks the right answer. */
    right?: boolean;
    /** A wrong answer the learner chose: struck through. */
    wrong?: boolean;
    /** Sent, waiting for the answer. */
    chosen?: boolean;
    disabled?: boolean;
    /** The answer is a picture (a flag, a map): the letter above it, in a frame. */
    picture?: boolean;
    /** Language of the answer text. */
    lang?: string;
    onclick?: () => void;
    children: Snippet;
  }

  let {
    letter,
    as = "li",
    right = false,
    wrong = false,
    chosen = false,
    disabled = false,
    picture = false,
    lang,
    onclick,
    children,
  }: Props = $props();
  const classes = $derived(["choice", { "is-right": right, "is-wrong": wrong, chosen, picture }]);
</script>

{#snippet content()}
  <b>{letter.toUpperCase()}</b>
  {#if picture}{@render children()}{:else}<span {lang}>{@render children()}</span>{/if}
{/snippet}

{#if as === "button"}
  <button class={classes} type="button" data-letter={letter} {disabled} {onclick}>{@render content()}</button>
{:else}
  <li class={classes} data-letter={letter}>{@render content()}</li>
{/if}

<style>
  .choice {
    display: grid;
    grid-template-columns: 2.25rem minmax(0, 1fr);
    align-items: start;
    padding-block: 0.75rem;
    border-top: 1px solid var(--rule);
  }
  button.choice {
    width: 100%;
    font: inherit;
    letter-spacing: inherit;
    text-align: left;
    color: var(--ink);
    background: var(--paper);
    cursor: pointer;
    border-inline: 0;
    border-bottom: 0;
    padding-inline: 0;
  }
  .picture {
    grid-template-columns: 1fr;
    justify-items: start;
    row-gap: 0.75rem;
    padding: 0.75rem;
    border: 1px solid var(--rule);
  }
  b {
    width: var(--line);
    height: var(--line);
    display: grid;
    place-items: center;
    border: 1px solid var(--ink);
    font-size: var(--xs);
    line-height: 1;
    letter-spacing: 0;
  }
  /* The German wording under the answer. */
  .choice :global(small) {
    display: block;
    color: var(--grey);
    font-size: var(--xs);
    line-height: var(--xs-lh);
    font-weight: 400;
    margin-top: 0.1875rem;
  }
  .picture :global(img) {
    width: 100%;
    max-height: 150px;
    object-fit: contain;
  }
  button.choice:hover:not(:disabled) b {
    border-color: var(--red);
    color: var(--red);
  }
  button.choice:disabled {
    cursor: default;
  }
  .chosen b {
    background: var(--ink);
    color: var(--paper);
  }
  .is-right b {
    background: var(--red);
    border-color: var(--red);
    color: var(--paper);
  }
  .is-right span {
    font-weight: 700;
  }
  .is-right :global(small) {
    font-weight: 400;
  }
  .is-wrong span {
    color: var(--grey);
    text-decoration: line-through;
    text-decoration-thickness: 1px;
  }
  .is-wrong :global(img) {
    opacity: 0.4;
  }
</style>
