<script lang="ts">
  // The learner's progress on the overview: lessons done, mock exams with their scores, and how ready they are for
  // the exam in each category.
  import type { Progress } from "./api.ts";

  interface Props {
    progress: Progress;
    texts: { lessonsDone: string; examsDone: string; ready: string };
  }

  let { progress: p, texts: t }: Props = $props();
  const exams = $derived(p.last_exams.map((e) => `${e.score}/${e.total}`).join(", "));
</script>

<section class="stats">
  <table class="facts">
    <tbody>
      <tr>
        <td>{p.lessons_done}/{p.lessons_total}</td>
        <th scope="row">{t.lessonsDone}</th>
      </tr>
      {#if exams}
        <tr>
          <td>{p.last_exams.length}</td>
          <th scope="row">{t.examsDone}: {exams}</th>
        </tr>
      {/if}
    </tbody>
  </table>
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
  .facts {
    border-collapse: collapse;
    width: 100%;
  }
  .facts tr {
    border-top: 1px solid var(--rule);
  }
  .facts tr:first-child {
    border-top: 0;
  }
  .facts td {
    width: 1%;
    white-space: nowrap;
    padding: 0.375rem var(--gutter) 0.375rem 0;
    text-align: left;
    vertical-align: baseline;
    font-size: var(--l);
    line-height: var(--l-lh);
    font-weight: 700;
    letter-spacing: -0.03em;
    font-variant-numeric: tabular-nums;
  }
  .facts th {
    text-align: left;
    font-weight: 400;
    vertical-align: baseline;
  }
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
