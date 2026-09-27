<script lang="ts">
  // Every lesson the learner can start now, unit by unit: the curriculum allows starting in many places, not only
  // where the recommendation points. Closed until the learner opens it; the whole graph is on the curriculum page.
  import Disclosure from "./Disclosure.svelte";
  import type { LessonChoice } from "./api.ts";

  interface Props {
    lessons: LessonChoice[];
    lang: string;
    texts: { openLessons: string; lesson: string; wholeCurriculum: string };
    onstart: (lessonId: string) => void;
  }

  let { lessons, lang, texts: t, onstart }: Props = $props();
  /** The lessons grouped by unit, in the order they come. */
  const units = $derived(
    lessons.reduce<{ unit: string; lessons: LessonChoice[] }[]>((groups, l) => {
      const last = groups.at(-1);
      if (last?.unit === l.unit) last.lessons.push(l);
      else groups.push({ unit: l.unit, lessons: [l] });
      return groups;
    }, []),
  );
</script>

<Disclosure label={t.openLessons} detail={String(lessons.length)}>
  {#each units as u (u.unit)}
    <h3>{u.unit}</h3>
    <ul>
      {#each u.lessons as l (l.id)}
        <li>
          <button type="button" onclick={() => onstart(l.id)}>
            <b>{Number(l.id.slice(1))}</b>
            {l.title}
          </button>
        </li>
      {/each}
    </ul>
  {/each}
  <p class="note"><a href={`/${lang}/curriculum/`}>{t.wholeCurriculum} →</a></p>
</Disclosure>

<style>
  h3 {
    font-size: var(--xs);
    line-height: var(--xs-lh);
    color: var(--grey);
    font-weight: 400;
  }
  h3:not(:first-child) {
    margin-top: var(--line);
  }
  ul {
    margin-top: 0.375rem;
  }
  li {
    border-top: 1px solid var(--rule);
  }
  button {
    display: block;
    width: 100%;
    padding-block: 0.375rem;
    padding-inline: 0;
    font: inherit;
    letter-spacing: inherit;
    text-align: left;
    color: var(--ink);
    background: none;
    border: 0;
    cursor: pointer;
  }
  button:hover {
    color: var(--red);
  }
  b {
    font-variant-numeric: tabular-nums;
    margin-right: 0.25rem;
  }
</style>
