<script lang="ts">
  // The heading of the information column: the topic, "Mock exam", "What's next".
  let { text }: { text: string } = $props();
</script>

<h2>{text}</h2>

<style>
  h2 {
    font-size: var(--m);
    line-height: var(--m-lh);
    margin-bottom: var(--line);
  }
</style>
