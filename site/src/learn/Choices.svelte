<script lang="ts">
  // The four answers of a step. The learner picks one (click, tap, or the keys A to D); after the feedback the right
  // answer is red and a wrong choice is struck through. Answers can be pictures (flags, maps), two per row.
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
    <button
      class={[
        "choice",
        {
          chosen: chosen === letter,
          "is-right": answered?.right === letter,
          "is-wrong": answered && answered.letter === letter && answered.right !== letter,
        },
      ]}
      type="button"
      data-letter={letter}
      disabled={Boolean(chosen || answered)}
      onclick={() => onanswer(letter)}
    >
      <b>{letter.toUpperCase()}</b>
      {#if images[letter]}
        <img src={images[letter]} alt={letter.toUpperCase()} />
      {:else}
        <span>{step.question.options[letter]}</span>
      {/if}
    </button>
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
  /* The same answer row as on the question pages (components/ui/AnswerRow.astro). */
  .choice {
    display: grid;
    grid-template-columns: 2.25rem minmax(0, 1fr);
    align-items: start;
    padding-block: 0.75rem;
    border-top: 1px solid var(--rule);
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
  .pictures .choice {
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
  img {
    width: 100%;
    max-height: 150px;
    object-fit: contain;
  }
  .choice:hover:not(:disabled) b {
    border-color: var(--red);
    color: var(--red);
  }
  .choice:disabled {
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
  .is-wrong span {
    color: var(--grey);
    text-decoration: line-through;
    text-decoration-thickness: 1px;
  }
  .is-wrong img {
    opacity: 0.4;
  }
</style>
