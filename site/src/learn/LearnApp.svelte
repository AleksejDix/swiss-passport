<script lang="ts">
  // Learn online: the screens of /learn on the state of learn.svelte.ts, which runs the learning actions of the REST
  // API. The page renders it in the browser only (client:only): progress lives under the learner code it remembers.
  import { onMount } from "svelte";
  import Overview from "./Overview.svelte";
  import Step from "./Step.svelte";
  import Summary from "./Summary.svelte";
  import ExamResult from "./ExamResult.svelte";
  import ErrorScreen from "./ErrorScreen.svelte";
  import { learn, type LearnTexts } from "./learn.svelte.ts";
  import { registerAgentTools } from "./webmcp.ts";
  import { LETTERS, type Letter } from "./api.ts";

  let { texts }: { texts: LearnTexts } = $props();
  // svelte-ignore state_referenced_locally
  learn.init(texts);

  onMount(() => {
    learn.home();
    registerAgentTools();
  });

  $effect(() => {
    document.documentElement.lang = learn.lang;
    document.title = `${learn.t.title}: Swiss Passport`;
  });

  // Keyboard: A to D answer, Enter continues. Only while the focus is on the question screen (WCAG 2.1.4), so the
  // letters never fire from the menus or collide with screen reader and voice control keys.
  function onkeydown(e: KeyboardEvent) {
    const target = e.target as Element;
    if (!target.closest(".cols") || target.closest("input, textarea") || e.metaKey || e.ctrlKey || e.altKey) return;
    const screen = learn.screen;
    const letter = e.key.toLowerCase() as Letter;
    if (LETTERS.includes(letter) && screen.name === "step" && !screen.chosen && !screen.answered) {
      e.preventDefault();
      learn.answer(letter);
      return;
    }
    if (e.key === "Enter" && learn.waiting && !target.closest("button")) {
      e.preventDefault();
      learn.proceed();
    }
  }
</script>

<svelte:document {onkeydown} />

{#if learn.screen.name === "loading"}
  <p class="small">Loading…</p>
{:else if learn.screen.name === "error"}
  <ErrorScreen />
{:else if learn.screen.name === "overview"}
  <Overview progress={learn.screen.progress} />
{:else if learn.screen.name === "step"}
  {#key learn.screen.step}
    <Step screen={learn.screen} />
  {/key}
{:else if learn.screen.name === "summary"}
  <Summary finished={learn.screen.finished} />
{:else}
  <ExamResult result={learn.screen.result} />
{/if}
