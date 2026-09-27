<script lang="ts">
  // The learner code on the overview: to continue on another device or in an AI app, and a form to use a code
  // from elsewhere.
  interface Props {
    code: string | null;
    texts: { yourCode: string; codeHelp: string; haveCode: string; useCode: string; unknownCode: string };
    /** Continues with the code; false when the server does not know it. */
    onuse: (code: string) => Promise<boolean>;
  }

  let { code, texts: t, onuse }: Props = $props();
  let unknown = $state(false);

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    const entered = String(new FormData(event.currentTarget as HTMLFormElement).get("code") ?? "").trim();
    if (!entered) return;
    unknown = !(await onuse(entered));
  }
</script>

<section class="code">
  <p>{t.yourCode}: <strong>{code}</strong></p>
  <p class="small">{t.codeHelp}</p>
  <form onsubmit={submit}>
    <input name="code" aria-label={t.haveCode} placeholder={t.haveCode} autocomplete="off" spellcheck="false" />
    <button type="submit">{t.useCode}</button>
  </form>
  <p class="error" role="alert" hidden={!unknown}>{t.unknownCode}</p>
</section>

<style>
  .code {
    margin-top: calc(2 * var(--line));
    border-top: 1px solid var(--rule);
    padding-top: calc(var(--line) - 1px);
  }
  strong {
    font-size: var(--m);
    letter-spacing: 0.04em;
  }
  .small {
    margin-top: 0.375rem;
  }
  form {
    display: flex;
    max-width: 24rem;
    margin-top: 0.75rem;
    border: 1px solid var(--ink);
  }
  input {
    flex: 1;
    min-width: 0;
    font: inherit;
    letter-spacing: inherit;
    border: 0;
    border-radius: 0;
    padding: 0.6875rem 0.75rem;
    background: var(--paper);
    color: var(--ink);
    /* stylelint-disable-next-line declaration-property-value-allowed-list -- a learner code is written in capitals (SEE-DAXP), not a label */
    text-transform: uppercase;
  }
  input:focus-visible {
    outline-offset: -2px;
  }
  input::placeholder {
    text-transform: none;
    color: var(--grey);
  }
  button {
    font: inherit;
    letter-spacing: inherit;
    font-weight: 700;
    border: 0;
    background: var(--ink);
    color: var(--paper);
    padding: 0 1.25rem;
    cursor: pointer;
  }
  button:hover {
    background: var(--red);
  }
  .error {
    color: var(--red);
    margin-top: 0.75rem;
  }
</style>
