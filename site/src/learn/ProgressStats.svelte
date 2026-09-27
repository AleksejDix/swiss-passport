<script lang="ts">
  // The learner's progress on the overview: lessons done, mock exams with their scores, and every question on the
  // question map, black when answered right, red when wrong, grey when not answered yet.
  import Facts from "../components/ui/Facts.svelte";
  import QuestionMap from "../components/ui/QuestionMap.svelte";
  import type { QuestionMapData } from "../viz/overview.ts";
  import type { Progress } from "./api.ts";

  interface Props {
    progress: Progress;
    texts: { lessonsDone: string; examsDone: string; map: QuestionMapData };
  }

  let { progress: p, texts: t }: Props = $props();
  const exams = $derived(p.last_exams.map((e) => `${e.score}/${e.total}`).join(", "));
</script>

<section class="stats">
  <Facts
    align="left"
    rows={[
      [`${p.lessons_done}/${p.lessons_total}`, t.lessonsDone],
      ...(exams ? [[p.last_exams.length, `${t.examsDone}: ${exams}`] as [number, string]] : []),
    ]}
  />
  <QuestionMap {...t.map} results={p.question_results ?? {}} />
</section>
