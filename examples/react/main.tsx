import { createRoot } from "react-dom/client";
import { FudaCard } from "./FudaCard";

createRoot(document.getElementById("root") as HTMLElement).render(
  <FudaCard
    title="Explorer One"
    category="ROCKET"
    stack={10}
    wear="near-mint"
    picture="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Crect width='10' height='10' fill='%23335'/%3E%3C/svg%3E"
  />,
);
