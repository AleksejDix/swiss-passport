<script lang="ts">
  // The end of a mock exam: the score, and each mistake with the right answer and why.
  import Frame from "./Frame.svelte";
  import Intro from "./Intro.svelte";
  import Score from "./Score.svelte";
  import Actions from "./Actions.svelte";
  import ActionButton from "./ActionButton.svelte";
  import InfoTitle from "./InfoTitle.svelte";
  import { learn } from "./learn.svelte.ts";
  import type { ExamFinished } from "./api.ts";

  let { result: r }: { result: ExamFinished } = $props();
  const t = $derived(learn.t);
</script>

<Frame>
  {#snippet head()}
    <Intro title={t.examResult} />
  {/snippet}
  {#snippet act()}
    <Score value={`${r.score}/${r.total}`} />
    <p class="small">{t.passMark}</p>
    <Actions after="text">
      <ActionButton primary label={t.overview} onclick={learn.home} />
    </Actions>
  {/snippet}
  {#snippet info()}
    {#if r.mistakes.length > 0}<InfoTitle text={t.mistakes} />{/if}
    <ol class="mistakes">
      {#each r.mistakes as m, i (i)}
        <li>
          <p class="q">{m.question}</p>
          <p class="w">{t.yours}: {m.your_answer.toUpperCase()}</p>
          <p class="a">{m.correct_answer.toUpperCase()}: {m.correct_answer_text}</p>
          <p class="w">{m.why}</p>
        </li>
      {/each}
    </ol>
  {/snippet}
</Frame>

<style>
  .mistakes li {
    padding-block: 0.75rem;
    border-top: 1px solid var(--rule);
  }
  .mistakes li:first-child {
    border-top: 0;
    padding-top: 0;
  }
  .q {
    font-weight: 700;
  }
  .a {
    color: var(--red);
    font-weight: 700;
  }
  .w {
    color: var(--grey);
  }
</style>
