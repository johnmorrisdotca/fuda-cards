import "@angular/compiler";
import { provideZonelessChangeDetection } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { FudaCardComponent } from "./fuda-card.component";

void bootstrapApplication(FudaCardComponent, { providers: [provideZonelessChangeDetection()] });
