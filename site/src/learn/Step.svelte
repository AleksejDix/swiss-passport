<script lang="ts">
  // One step, always in the same layout: the question with its answers and the Next button on the right, the topic
  // and after the answer the feedback on the left (on phones: question first, explanation below).
  import Frame from "./Frame.svelte";
  import StepHead from "./StepHead.svelte";
  import Question from "./Question.svelte";
  import Choices from "./Choices.svelte";
  import Verdict from "./Verdict.svelte";
  import InfoTitle from "./InfoTitle.svelte";
  import Feedback from "./Feedback.svelte";
  import Explanation from "./Explanation.svelte";
  import { learn, type Screen } from "./learn.svelte.ts";

  let { screen }: { screen: Extract<Screen, { name: "step" }> } = $props();
  const t = $derived(learn.t);
  const exam = learn.kind === "exam";
</script>

<Frame step>
  {#snippet head()}
    <StepHead title={screen.title} step={screen.step.step} back={t.overview} onback={learn.home} />
  {/snippet}
  {#snippet act()}
    <Question step={screen.step} images={screen.images} retryText={t.retry} />
    <Choices
      step={screen.step}
      images={screen.images}
      chosen={screen.chosen}
      answered={screen.answered && { letter: screen.answered.letter, right: screen.answered.feedback.correct_answer }}
      onanswer={learn.answer}
    />
    <!-- Screen readers announce the verdict; the focus moves on to Next. -->
    <div data-after aria-live="polite">
      {#if screen.answered}
        <Verdict feedback={screen.answered.feedback} texts={t} onnext={learn.proceed} />
      {/if}
    </div>
    {#if !screen.answered}<p class="hint">{t.keys}</p>{/if}
  {/snippet}
  {#snippet info()}
    <InfoTitle text={exam ? t.exam : screen.step.concept} />
    <div data-feedback>
      {#if screen.answered}<Feedback feedback={screen.answered.feedback} sourceLabel={t.source} />{/if}
    </div>
    {#if exam}
      <p class="small">{t.examNote}</p>
    {:else if screen.concept}
      <Explanation concept={screen.concept} label={t.showExplanation} />
    {:else if !screen.answered}
      <p class="small" data-answer-first>{t.answerFirst}</p>
    {/if}
  {/snippet}
</Frame>

<style>
  .hint {
    font-size: var(--xs);
    line-height: var(--xs-lh);
    letter-spacing: 0;
    color: var(--grey);
    margin-top: 0.75rem;
  }
</style>
