<script lang="ts">
  // Figures and what they count, the figures in a large size: right-aligned so units stand under units (the course in
  // numbers), or left-aligned beside their text (the learner's progress in /learn).
  interface Props {
    /** [figure, label] */
    rows: [figure: string | number, label: string][];
    align?: "right" | "left";
  }

  let { rows, align = "right" }: Props = $props();
</script>

<table class="facts">
  <tbody>
    {#each rows as [figure, label] (label)}
      <tr>
        <td class={align}>{figure}</td>
        <th scope="row">{label}</th>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .facts {
    border-collapse: collapse;
    width: 100%;
  }
  tr {
    border-top: 1px solid var(--rule);
  }
  tr:first-child {
    border-top: 0;
  }
  td {
    width: 1%;
    white-space: nowrap;
    padding: 0.375rem var(--gutter) 0.375rem 0;
    vertical-align: baseline;
    font-size: var(--l);
    line-height: var(--l-lh);
    font-weight: 700;
    letter-spacing: -0.03em;
    font-variant-numeric: tabular-nums;
  }
  .right {
    text-align: right;
  }
  .left {
    text-align: left;
  }
  th {
    text-align: left;
    font-weight: 400;
    vertical-align: baseline;
  }
</style>
