<script lang="ts">
import { onMount } from "svelte";

let {
  title,
  picture,
  stack = 1,
  wear = "",
}: { title: string; picture: string; stack?: number; wear?: string } = $props();

// The element needs a browser: onMount never runs on the server.
onMount(() => {
  void import("@johnmorrisdotca/fuda-cards/element");
});
</script>

<fuda-card {title} {stack} {wear}><img src={picture} alt={title} /></fuda-card>
