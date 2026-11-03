import { createApp, h } from "vue";
import FudaCard from "./FudaCard.vue";

const picture =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Crect width='10' height='10' fill='%23335'/%3E%3C/svg%3E";
const app = createApp({ render: () => h(FudaCard, { title: "Explorer One", picture, stack: 10, wear: "near-mint" }) });
app.config.compilerOptions.isCustomElement = (tag) => tag === "fuda-card";
app.mount("#app");
