import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "fuda-card": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & Record<string, string | undefined>;
    }
  }
}
