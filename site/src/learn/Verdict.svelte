<script lang="ts">
  // After an answer, under the question: right, or the right answer (also in German), whether the question comes
  // back later in the round, and the Next button, always in the same place.
  import NextButton from "./NextButton.svelte";
  import type { Feedback } from "./api.ts";

  interface Props {
    feedback: Feedback;
    texts: { right: string; wrong: string; comesAgain: string; next: string };
    onnext: () => void;
  }

  let { feedback: f, texts: t, onnext }: Props = $props();
</script>

<div class="verdict">
  <p class={["verdict-line", { ok: f.correct }]}>
    {f.correct ? t.right : `${t.wrong} ${f.correct_answer.toUpperCase()}: ${f.correct_answer_text}`}
  </p>
  {#if f.correct_answer_german && !f.correct}<p class="german" lang="de">{f.correct_answer_german}</p>{/if}
  {#if f.comes_again_later_in_this_round}<p class="retry">{t.comesAgain}</p>{/if}
  <NextButton label={t.next} onclick={onnext} focus />
</div>

<style>
  .verdict {
    margin-top: var(--line);
  }
  .verdict-line {
    font-weight: 700;
  }
  .ok {
    color: var(--red);
  }
  .german {
    color: var(--grey);
    margin-top: 0.375rem;
  }
  .retry {
    font-size: var(--xs);
    line-height: var(--xs-lh);
    letter-spacing: 0;
    font-weight: 700;
    color: var(--red);
    margin-top: 0.75rem;
  }
</style>
