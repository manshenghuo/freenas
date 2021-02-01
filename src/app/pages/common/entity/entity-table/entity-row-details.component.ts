import { Component, Input } from "@angular/core";
import { EntityAction, EntityRowDetails } from "./entity-row-details.interface";

@Component({
  selector: "app-entity-row-details",
  styles: [
    `
      p,
      h4,
      mat-icon {
        color: var(--fg2) !important;
      }

      .button-delete span,
      .button-delete mat-icon {
        color: var(--red) !important;
      }
    `
  ],
  templateUrl: "./entity-row-details.component.html"
})
export class EntityRowDetailsComponent {
  @Input() public conf: EntityRowDetails;

  public isActionVisible(action: EntityAction): boolean {
    return this.conf.isActionVisible ? this.conf.isActionVisible(action.id, this.conf.config) : true;
  }
}
