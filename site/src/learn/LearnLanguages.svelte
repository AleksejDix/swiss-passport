<script lang="ts">
  // The language buttons of /learn in the masthead: a small island of its own that shares the app's state.
  import LanguageNav from "../components/layout/LanguageNav.svelte";
  import { learn } from "./learn.svelte.ts";

  interface Props {
    names: Record<string, string>;
    /** The accessible name of the buttons in each language. */
    labels: Record<string, string>;
  }

  let { names, labels }: Props = $props();
</script>

<LanguageNav {names} label={labels[learn.lang] ?? labels.en} lang={learn.lang} onchoose={learn.setLang} />
