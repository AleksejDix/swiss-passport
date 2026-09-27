<script lang="ts">
  // Where the learner is in the round: the lesson, the step (4/9) and the way back. The rule under it fills with red
  // as the round goes on.
  interface Props {
    title: string;
    /** "4/9" */
    step: string;
    back: string;
    onback: () => void;
  }

  let { title, step, back, onback }: Props = $props();
  const percent = $derived.by(() => {
    const [n, total] = step.split("/").map(Number);
    return Math.round((100 * (n - 1)) / total);
  });
</script>

<div class="intro-step">
  <div class="step-head">
    <span>{title}</span>
    <span>{step}</span>
    <button type="button" onclick={onback}>{back}</button>
  </div>
  <div class="bar"><i style:width="{percent}%"></i></div>
</div>

<style>
  .intro-step {
    display: grid;
    grid-template-columns: var(--grid);
    column-gap: var(--gutter);
  }
  .step-head {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: subgrid;
    row-gap: 0.375rem;
    align-items: baseline;
    font-size: var(--xs);
    line-height: var(--xs-lh);
    letter-spacing: 0;
    color: var(--grey);
  }
  .step-head > :first-child {
    grid-column: 1 / -1;
    color: var(--ink);
    font-weight: 700;
  }
  .step-head > :nth-child(2) {
    grid-column: 1 / span 2;
    font-variant-numeric: tabular-nums;
  }
  button {
    grid-column: 3 / -1;
    justify-self: end;
    font: inherit;
    letter-spacing: inherit;
    background: none;
    border: 0;
    padding: 0;
    color: var(--grey);
    cursor: pointer;
    white-space: nowrap;
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.2em;
  }
  button:hover {
    color: var(--red);
  }
  .bar {
    grid-column: 1 / -1;
    height: 3px;
    margin-top: 0.75rem;
    background-image: linear-gradient(var(--ink), var(--ink));
    background-position: left bottom;
    background-size: 100% 1px;
    background-repeat: no-repeat;
  }
  .bar i {
    display: block;
    height: 100%;
    background: var(--red);
    transition: width 0.3s;
  }
  @media (min-width: 64rem) {
    .step-head > :first-child {
      grid-column: 1 / span 5;
    }
    .step-head > :nth-child(2) {
      grid-column: 7 / span 3;
    }
    button {
      grid-column: 10 / span 3;
    }
  }
</style>
