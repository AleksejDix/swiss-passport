<script lang="ts">
  // The learner's progress on the overview: lessons done, mock exams with their scores, and how ready they are for
  // the exam in each category.
  import Facts from "../components/ui/Facts.svelte";
  import type { Progress } from "./api.ts";

  interface Props {
    progress: Progress;
    texts: { lessonsDone: string; examsDone: string; ready: string };
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
  <p class="small readiness-title">{t.ready}</p>
  <ul class="readiness">
    {#each p.readiness_by_category as c (c.category)}
      <li>
        <span>{c.category}</span>
        <span>{c.percent}%</span>
        <span class="meter" aria-hidden="true"><i style:width="{c.percent}%"></i></span>
      </li>
    {/each}
  </ul>
</section>

<style>
  .readiness-title {
    margin-top: var(--line);
  }
  .readiness {
    margin-top: 0.75rem;
  }
  .readiness li {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    column-gap: var(--gutter);
    padding-top: 0.375rem;
  }
  .readiness li > span:nth-child(2) {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  .meter {
    grid-column: 1 / -1;
    height: 3px;
    margin-top: 0.375rem;
    background: var(--field);
  }
  .meter i {
    display: block;
    height: 100%;
    background: var(--red);
  }
</style>
