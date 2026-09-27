<script lang="ts">
  // The overview: what to do next (up to three lessons from different units, the recommended one first; then
  // reviews and the mock exam), the progress and the learner code.
  import Frame from "./Frame.svelte";
  import Intro from "./Intro.svelte";
  import Actions from "./Actions.svelte";
  import ActionButton from "./ActionButton.svelte";
  import ProgressStats from "./ProgressStats.svelte";
  import LearnerCode from "./LearnerCode.svelte";
  import { learn } from "./learn.svelte.ts";
  import type { Progress } from "./api.ts";

  let { progress: p }: { progress: Progress } = $props();
  const t = $derived(learn.t);
</script>

<Frame>
  {#snippet head()}
    <Intro title={t.title} lede={t.lede} note={t.unofficial} />
  {/snippet}
  {#snippet act()}
    <Actions title={p.lessons_done ? t.chooseNext : t.startWith}>
      {#each p.lesson_choices.slice(0, 3) as lesson, i (lesson.id)}
        <ActionButton
          primary={i === 0}
          label={`${t.lesson} ${Number(lesson.id.slice(1))}: ${lesson.title}`}
          detail={i ? lesson.unit : t.recommended}
          onclick={() => learn.start("start_lesson", { lesson_id: lesson.id })}
        />
      {:else}
        <ActionButton primary disabled label={t.allDone} />
      {/each}
    </Actions>
    <Actions after="group">
      <ActionButton
        label={t.reviews}
        detail={p.reviews_due ? t.due.replace("{n}", String(p.reviews_due)) : t.noneDue}
        disabled={!p.reviews_due}
        onclick={() => learn.start("start_reviews")}
      />
      <ActionButton label={t.exam} detail={t.examSub} onclick={() => learn.start("start_mock_exam")} />
    </Actions>
  {/snippet}
  {#snippet info()}
    <ProgressStats progress={p} texts={t} />
    <LearnerCode code={learn.code} texts={t} onuse={learn.useCode} />
  {/snippet}
</Frame>
