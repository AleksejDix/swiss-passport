<script lang="ts">
  // All questions at a glance: one dot per question, grouped by lesson and unit. Every lesson links to its questions
  // and names itself in the line below on hover or focus. With a learner's results the dots show them: black right,
  // red wrong, grey not answered yet. On static pages `stored` loads the results of the learner code this browser
  // remembers (/learn), and `intro` fills the dots in when the map scrolls into view; /learn passes `results`.
  import { onMount } from "svelte";
  import { storage } from "../../learn/storage.ts";
  import type { QuestionMapData } from "../../viz/overview.ts";

  type Results = Record<string, "right" | "wrong">;
  interface Props extends QuestionMapData {
    results?: Results;
    stored?: boolean;
    intro?: boolean;
  }

  let { units, texts: t, results: given, stored = false, intro = false }: Props = $props();
  let loaded = $state<Results>();
  const results = $derived(given ?? loaded);
  let readout = $state<string>();
  let figure: HTMLElement;

  /** The results of the learner code this browser remembers. Without a code, or offline, the map stays black. */
  async function load() {
    const code = storage.get("sp-code");
    if (!code) return;
    try {
      const res = await fetch("/api/v1/progress", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ learner_code: code }),
      });
      if (res.ok) loaded = (await res.json()).question_results;
    } catch {
      /* offline: the map stays as it is */
    }
  }

  /** The dots fill in lesson by lesson, 350 in about 1.4 seconds, when the map scrolls into view. */
  function fillIn() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const dots = [...figure.querySelectorAll("i")];
    for (const d of dots) d.style.opacity = "0";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        dots.forEach((d, i) =>
          d.animate(
            [
              { opacity: 0, transform: "scale(0.2)" },
              { opacity: 1, transform: "scale(1)" },
            ],
            { duration: 260, delay: i * 4, easing: "cubic-bezier(0.3, 1.6, 0.5, 1)", fill: "forwards" },
          ),
        );
      },
      { threshold: 0.3 },
    );
    observer.observe(figure);
  }

  onMount(() => {
    if (intro) fillIn();
    if (stored) load();
  });
</script>

<figure class="qmap" class:has-results={results} bind:this={figure} data-qmap>
  <figcaption class="viz-title">{t.title}</figcaption>
  {#if results}
    <ul class="qmap-legend">
      <li><i class="right"></i>{t.right}</li>
      <li><i class="wrong"></i>{t.wrong}</li>
      <li><i></i>{t.open}</li>
    </ul>
  {/if}
  <div class="qmap-units">
    {#each units as u (u.id)}
      <div class="qmap-unit">
        <p class="qmap-unit-title">{u.title}</p>
        <div class="qmap-lessons">
          {#each u.lessons as l (l.id)}
            <a
              class="qmap-lesson"
              href={l.href}
              aria-label={l.label}
              title={l.label}
              onpointerenter={() => (readout = l.label)}
              onfocus={() => (readout = l.label)}
              onpointerleave={() => (readout = undefined)}
              onblur={() => (readout = undefined)}
            >
              {#each l.questions as q (q)}
                <i class={results?.[q]}></i>
              {/each}
            </a>
          {/each}
        </div>
      </div>
    {/each}
  </div>
  <p class="qmap-readout" class:is-lesson={readout} aria-hidden="true" data-readout>{readout ?? t.hint}</p>
</figure>

<style>
  :global(.row) .qmap {
    grid-column: 1 / -1;
    margin-top: calc(1.5 * var(--line));
  }
  .qmap .viz-title {
    font-weight: 700;
  }
  .qmap-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem 1.25rem;
    margin-top: 0.375rem;
    font-size: var(--xs);
    line-height: var(--xs-lh);
    color: var(--grey);
  }
  .qmap-legend li {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }
  .qmap-units {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
    gap: var(--line) var(--gutter);
    margin-top: 0.75rem;
  }
  .qmap-unit-title {
    font-size: var(--xs);
    line-height: var(--xs-lh);
    color: var(--grey);
  }
  /* Side by side, two-line unit titles keep the dots of neighbouring units on one line. */
  @media (min-width: 40rem) {
    .qmap-unit-title {
      min-height: calc(2 * var(--xs-lh));
    }
  }
  .qmap-lessons {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 0.25rem;
    margin-top: 0.375rem;
    margin-left: -0.3125rem;
  }
  /* The lesson is the link: its hit area is larger than its dots. */
  .qmap-lesson {
    display: grid;
    grid-template-columns: repeat(3, 0.5rem);
    gap: 0.1875rem;
    padding: 0.3125rem;
    text-decoration: none;
  }
  i {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: var(--ink);
    transition: background-color 0.15s;
  }
  /* Without results a lesson turns red on hover; with results red means wrong, so the lesson gets a frame instead. */
  .qmap:not(.has-results) .qmap-lesson:is(:hover, :focus-visible) i {
    background: var(--red);
  }
  .has-results .qmap-lesson:is(:hover, :focus-visible) {
    outline: 1px solid var(--ink);
  }
  .has-results i {
    background: var(--rule);
  }
  .has-results i.right {
    background: var(--ink);
  }
  .has-results i.wrong {
    background: var(--red);
  }
  .qmap-lesson:focus-visible {
    outline-offset: 0;
  }
  .qmap-readout {
    font-size: var(--xs);
    line-height: var(--xs-lh);
    color: var(--grey);
    margin-top: 0.75rem;
    min-height: calc(2 * var(--xs-lh));
  }
  .qmap-readout.is-lesson {
    color: var(--ink);
  }
</style>
