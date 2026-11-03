import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, type OnInit } from "@angular/core";

@Component({
  selector: "app-fuda-card",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<fuda-card [attr.title]="title" [attr.stack]="stack" [attr.wear]="wear"><img [src]="picture" [alt]="title" /></fuda-card>`,
})
export class FudaCardComponent implements OnInit {
  @Input() title = "Explorer One";
  @Input() picture =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Crect width='10' height='10' fill='%23335'/%3E%3C/svg%3E";
  @Input() stack = 10;
  @Input() wear = "near-mint";

  ngOnInit(): void {
    // The element needs a browser: ngOnInit also runs when a server renders, so the import waits for one.
    if (typeof window !== "undefined") void import("@johnmorrisdotca/fuda-cards/element");
  }
}
