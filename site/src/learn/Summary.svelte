<script lang="ts">
  // The end of a lesson or of reviews: how many were right at the first try, and what to do next.
  import Frame from "./Frame.svelte";
  import Intro from "./Intro.svelte";
  import Score from "./Score.svelte";
  import Actions from "./Actions.svelte";
  import ActionButton from "./ActionButton.svelte";
  import InfoTitle from "./InfoTitle.svelte";
  import { learn } from "./learn.svelte.ts";
  import type { LessonFinished } from "./api.ts";

  let { finished: f }: { finished: LessonFinished } = $props();
  const t = $derived(learn.t);
</script>

<Frame>
  {#snippet head()}
    <Intro title={f.lesson ? t.doneLesson : t.doneReview} />
  {/snippet}
  {#snippet act()}
    <Score value={`${f.correct_first_try}/${f.total}`} />
    <p>{t.firstTry}</p>
    <Actions after="text">
      {#if f.next_lesson}
        <ActionButton primary label={t.nextLesson} detail={f.next_lesson} onclick={() => learn.start("start_lesson")} />
      {/if}
      {#if f.reviews_due > 0}
        <ActionButton
          label={t.reviews}
          detail={t.due.replace("{n}", String(f.reviews_due))}
          onclick={() => learn.start("start_reviews")}
        />
      {/if}
      <ActionButton label={t.overview} onclick={learn.home} />
    </Actions>
  {/snippet}
  {#snippet info()}
    <InfoTitle text={t.whatNext} />
    <p>{t.whatNextText}</p>
  {/snippet}
</Frame>
