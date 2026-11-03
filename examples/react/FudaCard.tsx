import { type CardOptions, cardAttributes } from "@johnmorrisdotca/fuda-cards";
import { useEffect } from "react";

export function FudaCard({ picture, ...options }: CardOptions & { picture: string }) {
  useEffect(() => {
    // The element needs a browser, so it is imported here, never at the top of the file: a server render never reaches an effect.
    void import("@johnmorrisdotca/fuda-cards/element");
  }, []);
  return (
    <fuda-card {...cardAttributes(options)}>
      <img src={picture} alt={options.title ?? ""} />
    </fuda-card>
  );
}
