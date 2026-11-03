<script setup lang="ts">
import { onMounted } from "vue";

defineProps<{ title: string; picture: string; stack?: number; wear?: string }>();

// The element needs a browser: import it once the component is on the page, never while a server renders it.
onMounted(() => {
  void import("@johnmorrisdotca/fuda-cards/element");
});
</script>

<template>
  <fuda-card :title="title" :stack="stack" :wear="wear"><img :src="picture" :alt="title" /></fuda-card>
</template>
