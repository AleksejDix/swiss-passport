<script lang="ts">
  // The languages, in the masthead: in three rows on tablets and wide screens, the current one in bold. Links to this
  // page in each language; on /learn, buttons that switch the language without a reload (learn/LearnLanguages).
  // Rendered as plain HTML on every page; only /learn hydrates it.
  interface Props {
    /** Each language's name in itself: { de: "Deutsch", … }. */
    names: Record<string, string>;
    label: string;
    /** The current language, in bold. */
    lang?: string;
    /** Link mode: this page in each language; languages without it lead to their homepage. */
    links?: Record<string, string>;
    /** Button mode: called with the chosen language. */
    onchoose?: (lang: string) => void;
  }

  let { names, label, lang, links = {}, onchoose }: Props = $props();
</script>

<nav class="langs-nav" aria-label={label} data-langs={onchoose ? "" : undefined}>
  {#each Object.entries(names) as [id, name] (id)}
    {#if onchoose}
      <button type="button" lang={id} aria-pressed={id === lang ? "true" : "false"} onclick={() => onchoose(id)}>
        {name}
      </button>
    {:else}
      <a
        href={links[id] ?? `/${id}/`}
        hreflang={id}
        lang={id}
        aria-current={id === lang ? "page" : undefined}
        data-lang={id}
      >
        {name}
      </a>
    {/if}
  {/each}
</nav>

<style>
  .langs-nav {
    grid-column: 1 / -1;
    display: flex;
    flex-wrap: wrap;
    column-gap: 1rem;
  }
  .langs-nav > * {
    font: inherit;
    letter-spacing: inherit;
    color: var(--grey);
    text-decoration: none;
    text-align: left;
    background: none;
    border: 0;
    padding: 0;
    cursor: pointer;
    justify-self: start;
  }
  .langs-nav > *:hover {
    color: var(--ink);
  }
  .langs-nav > [aria-current],
  .langs-nav > [aria-pressed="true"] {
    color: var(--ink);
    font-weight: 700;
  }
  @media (min-width: 40rem) {
    .langs-nav {
      grid-column: 5 / span 4;
      display: grid;
      grid-template-rows: repeat(3, auto);
      grid-auto-flow: column;
      justify-content: start;
      column-gap: var(--gutter);
    }
  }
  @media (min-width: 64rem) {
    .langs-nav {
      grid-column: 10 / span 3;
      grid-template-columns: subgrid;
    }
    .langs-nav > :nth-child(n + 4) {
      grid-column: span 2;
    }
  }
</style>
