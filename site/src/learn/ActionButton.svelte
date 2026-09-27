<script lang="ts">
  // What to do next, as a wide button: the action on the left, a detail on the right. The first choice is black.
  interface Props {
    label: string;
    detail?: string;
    primary?: boolean;
    disabled?: boolean;
    onclick?: () => void;
  }

  let { label, detail = "", primary = false, disabled = false, onclick }: Props = $props();
</script>

<button class={["action", { primary }]} {disabled} {onclick}>
  <span>{label}</span>
  <span>{detail}</span>
</button>

<style>
  .action {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--gutter);
    width: 100%;
    font: inherit;
    letter-spacing: inherit;
    text-align: left;
    padding: calc(0.75rem - 1px) 1rem;
    cursor: pointer;
    border: 1px solid var(--ink);
    background: var(--paper);
    color: var(--ink);
  }
  .primary {
    background: var(--ink);
    color: var(--paper);
  }
  .action:hover:not(:disabled) {
    border-color: var(--red);
    color: var(--red);
  }
  .primary:hover:not(:disabled) {
    background: var(--red);
    color: var(--paper);
  }
  .action:disabled {
    border-color: var(--rule);
    color: var(--grey);
    cursor: default;
  }
  span:first-child {
    font-weight: 700;
  }
  span:last-child {
    font-size: var(--xs);
    line-height: var(--xs-lh);
    letter-spacing: 0;
    text-align: right;
  }
</style>
