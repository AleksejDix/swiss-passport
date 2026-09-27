<script lang="ts">
  // The question of a step: a note when it comes back after a mistake, the question (the heading of the screen, which
  // takes the focus), its German wording and its picture.
  import { onMount } from "svelte";
  import type { Images, Step } from "./api.ts";

  interface Props {
    step: Step;
    images: Images;
    /** The note for a question answered wrongly earlier in the round. */
    retryText: string;
  }

  let { step, images, retryText }: Props = $props();
  let heading: HTMLHeadingElement;
  onMount(() => heading.focus({ preventScroll: true }));
</script>

{#if step.retry}<p class="retry">{retryText}</p>{/if}
<h1 class="question" tabindex="-1" bind:this={heading}>{step.question.question}</h1>
{#if step.question.german}<p class="german" lang="de">{step.question.german.question}</p>{/if}
{#if images.question}<img class="qpicture" src={images.question} alt="" />{/if}

<style>
  .retry {
    font-size: var(--xs);
    line-height: var(--xs-lh);
    letter-spacing: 0;
    font-weight: 700;
    color: var(--red);
  }
  .retry + .question {
    margin-top: 0.75rem;
  }
  /* The question is the h1 of the screen, set and broken like the running text around it. */
  .question {
    font-size: var(--m);
    line-height: var(--m-lh);
    letter-spacing: -0.012em;
    font-weight: 700;
    margin-inline-start: 0;
    text-wrap: pretty;
    hyphens: manual;
  }
  .question:lang(de) {
    hyphens: auto;
    hyphenate-limit-chars: 12 5 5;
  }
  .question:focus {
    outline: none;
  }
  .german {
    color: var(--grey);
    margin-top: 0.375rem;
  }
  .qpicture {
    display: block;
    width: auto;
    margin-top: var(--line);
    max-height: 20rem;
  }
</style>
