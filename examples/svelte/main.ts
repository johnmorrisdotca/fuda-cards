import { mount } from "svelte";
import FudaCard from "./FudaCard.svelte";

const picture =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Crect width='10' height='10' fill='%23335'/%3E%3C/svg%3E";
mount(FudaCard, {
  target: document.getElementById("app") as HTMLElement,
  props: { title: "Explorer One", picture, stack: 10, wear: "near-mint" },
});
