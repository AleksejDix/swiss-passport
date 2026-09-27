<script lang="ts">
  // The one way on: black, red under the pointer. It takes the focus when it appears, so Enter continues.
  import { onMount } from "svelte";

  interface Props {
    label: string;
    onclick: () => void;
    focus?: boolean;
  }

  let { label, onclick, focus = false }: Props = $props();
  let button: HTMLButtonElement;
  onMount(() => {
    if (focus) button.focus({ preventScroll: true });
  });
</script>

<button class="next" type="button" bind:this={button} {onclick}>{label}</button>

<style>
  .next {
    margin-top: var(--line);
    font: inherit;
    letter-spacing: inherit;
    font-weight: 700;
    padding: 0.75rem 1.5rem;
    border: 0;
    background: var(--ink);
    color: var(--paper);
    cursor: pointer;
  }
  .next:hover {
    background: var(--red);
  }
</style>
