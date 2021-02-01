import { Component, ViewChild, Input, OnInit } from '@angular/core';
import { Display } from 'app/core/components/display/display.component';
import { ViewControllerComponent } from 'app/core/components/viewcontroller/viewcontroller.component';
import { MaterialModule } from '../../../appMaterial.module';

/*
export interface CardData {
  header?: any;
  content?: any;
  footer?: any;
}
 */

// This makes the metadata available globally
export const CardComponentMetadata = {
  selector: '[card]',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
}

@Component({
  selector: '[card]',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent extends ViewControllerComponent {

  readonly componentName = CardComponent;
  @Input() data: any; 


  /*
   * Properties
   * Wraps all content in an md-card
   * private headerTitle?: string 
   * private headerOptions?: ViewControl 
   * private primaryAction?: ViewFabButton
   * Methods
   * addHeaderTitle(title: string);
   * addHeaderOptions(); // adds Options menu to header
   * addFooterControls(ViewButton[]);
   * addPrimaryAction(btn:  ViewFabButton);
   */	

  //@ViewChild('display', { static: true}) display; // Already created in base class by default
  public primaryAction?: any; /*ViewFabButton*/
  public header: boolean = false;
  public headerTitle?: string;
  //public headerOptions?: any; /*ViewControl*/
  @ViewChild('headerOptions', { static: true}) headerOptions;

  public footer: boolean = true;
  @ViewChild('footerControls', { static: true}) footerControls;

  constructor(){
    super();
    this.layoutChild = {flex:"100%"};
  }

  getHeaderTitle(): string{
    return this.headerTitle;
  }
  setHeaderTitle(title: string){
    this.headerTitle = title
  }
  addHeaderOptions(){} // adds Options menu to header
  addFooterControls(controls: any /*ViewButton[]*/){}
  addPrimaryAction(fab:any/*ViewFabButton*/){}


}
