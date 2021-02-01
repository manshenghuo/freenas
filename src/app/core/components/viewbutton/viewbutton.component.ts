import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../appMaterial.module';
import { ViewControlComponent } from 'app/core/components/viewcontrol/viewcontrol.component';

@Component({
  selector: 'viewbutton',
  templateUrl: './viewbutton.component.html',
  //styleUrls: ['./viewbutton.component.css']
})
export class ViewButtonComponent extends ViewControlComponent implements OnInit {

  readonly componentName = ViewButtonComponent;
  public raised: boolean = false;
  public contextColor: string = "primary";
  public label: string = 'Button';
  public tooltipEnabled:boolean = false;
  public tooltipText: string;
  public tooltipPlacement: string;

  constructor() {
    super();
  }

  ngOnInit() {
  }


}
