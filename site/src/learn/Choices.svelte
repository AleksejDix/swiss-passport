<script lang="ts">
  // The four answers of a step. The learner picks one (click, tap, or the keys A to D); after the feedback the right
  // answer is red and a wrong choice is struck through. Answers can be pictures (flags, maps), two per row.
  import AnswerRow from "../components/ui/AnswerRow.svelte";
  import { LETTERS, type Images, type Letter, type Step } from "./api.ts";

  interface Props {
    step: Step;
    images: Images;
    /** The letter sent, while the answer is on its way. */
    chosen?: Letter;
    /** Once the answer is back: what the learner chose, and the right answer. */
    answered?: { letter: Letter; right: Letter };
    onanswer: (letter: Letter) => void;
  }

  let { step, images, chosen, answered, onanswer }: Props = $props();
  const pictures = $derived(Boolean(images.a));
</script>

<div class={["choices", { pictures }]} data-choices>
  {#each LETTERS as letter (letter)}
    <AnswerRow
      as="button"
      {letter}
      picture={Boolean(images[letter])}
      chosen={chosen === letter}
      right={answered?.right === letter}
      wrong={answered?.letter === letter && answered.right !== letter}
      disabled={Boolean(chosen || answered)}
      onclick={() => onanswer(letter)}
    >
      {#if images[letter]}
        <img src={images[letter]} alt={letter.toUpperCase()} />
      {:else}
        {step.question.options[letter]}
      {/if}
    </AnswerRow>
  {/each}
</div>

<style>
  .choices {
    display: grid;
    margin-top: var(--line);
    border-bottom: 1px solid var(--rule);
  }
  .pictures {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--gutter);
    border-bottom: 0;
  }
</style>
