import { ApplicationRef, Component, Injector, AfterContentInit, OnChanges, SimpleChanges, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { RestService, WebSocketService } from 'app/services/';
import { MaterialModule } from 'app/appMaterial.module';
import { EnclosureDisksComponent} from './enclosure-disks/enclosure-disks.component';

import { CoreService, CoreEvent } from 'app/core/services/core.service';
import { Subject } from 'rxjs';
import { SystemProfiler } from 'app/core/classes/system-profiler';
import { ErrorMessage } from 'app/core/classes/ix-interfaces';

interface ViewConfig {
  name: string;
  alias: string; // Used for tab label
  icon: string;
  id: number;
  elementIndex?: number;
  showInNavbar: boolean;
}

@Component({
  selector : 'view-enclosure',
  templateUrl :'./view-enclosure.component.html',
  styleUrls:['./view-enclosure.component.css']
})
export class ViewEnclosureComponent implements AfterContentInit, OnChanges, OnDestroy {

  public errors: ErrorMessage[] = [];
  public events:Subject<CoreEvent> ;
  @ViewChild('navigation', { static: false}) nav: ElementRef

  //public currentView: ViewConfig
  public currentView: ViewConfig =  { 
      name: 'Disks',
      alias: 'Disks',
      icon: "harddisk",
      id: 0,
      showInNavbar: true
  }
   
  public scrollContainer: HTMLElement;
  public system: SystemProfiler;
  public selectedEnclosure: any;
  public views: ViewConfig[] = [];
  public spinner: boolean = true;

  public supportedHardware: boolean = false;
  public system_manufacturer: string;
  private _system_product;
  get system_product(){
    return this._system_product;
  }
  set system_product(value){
    if(!this._system_product){
      this._system_product = value;
      this.core.emit({name: 'EnclosureDataRequest', sender: this});
    }
  }

  changeView(id){
    this.currentView = this.views[id];
  }

  constructor(private core: CoreService, protected router: Router){

    this.events = new Subject<CoreEvent>();
    this.events.subscribe((evt:CoreEvent) => {
      switch(evt.name){
        case "VisualizerReady":
          this.extractVisualizations();
          break;
        case "EnclosureCanvas":
          if(!this.nav){
            console.warn("No navigation UI detected")
            return;
          }
          const selector = ".enclosure-" + evt.data.profile.enclosureKey;
          let el = this.nav.nativeElement.querySelector(selector);

          let oldCanvas = this.nav.nativeElement.querySelector(selector + ' canvas');
          if(oldCanvas){
            el.removeChild(oldCanvas);
          }

          evt.data.canvas.setAttribute('style', 'width: 80% ;');
          el.appendChild(evt.data.canvas);
          break;
        case "Error":
          this.errors.push(evt.data);
          console.warn({ERROR_REPORT: this.errors});
          break;
        case "SetEnclosureLabel":
          core.emit(evt);
          break;
      }
    })

    core.register({observerClass: this, eventName: 'ThemeChanged'}).subscribe((evt:CoreEvent) => {
      if(this.system) {
        this.extractVisualizations();
      }
    });

    core.register({observerClass: this, eventName: 'EnclosureData'}).subscribe((evt:CoreEvent) => {
      this.system = new SystemProfiler(this.system_product, evt.data);
      this.selectedEnclosure = this.system.profile[this.system.headIndex];
      core.emit({name: 'DisksRequest', sender: this});
    });

    core.register({observerClass: this, eventName: 'EnclosureLabelChanged'}).subscribe((evt:CoreEvent) => {
      this.system.enclosures[evt.data.index].label = evt.data.label;
      this.events.next(evt);
    });

    core.register({observerClass: this, eventName: 'PoolData'}).subscribe((evt:CoreEvent) => {
      this.system.pools = evt.data;
      this.addViews();
    });


    core.register({observerClass: this, eventName: 'SensorData'}).subscribe((evt:CoreEvent) => {
      this.system.sensorData = evt.data;
      core.emit({name: 'PoolDataRequest', sender: this});
    });

    core.register({observerClass: this, eventName: 'DisksData'}).subscribe((evt:CoreEvent) => {
      this.system.diskData = evt.data;
      core.emit({name: 'SensorDataRequest', sender: this});
      setTimeout(() => {
        this.spinner = false;
      }, 1500);
    });

    core.register({observerClass: this, eventName: 'SysInfo'}).subscribe((evt:CoreEvent) => {
      if(!this.system_product){
        this.system_product = evt.data.system_product;
        this.system_manufacturer = evt.data.system_manufacturer.toLowerCase();
        this.supportedHardware = evt.data.features.enclosure;
      } else {
        return;
      }
    });

    core.emit({name: 'SysInfoRequest', sender: this});
  }

  ngAfterContentInit(){
    this.scrollContainer = document.querySelector('.rightside-content-hold');
    this.scrollContainer.style.overflow = 'hidden';
  }

  ngOnChanges(changes:SimpleChanges){
  }

  ngOnDestroy(){
    this.core.unregister({observerClass:this});
    this.scrollContainer.style.overflow = 'auto';
  }

  selectEnclosure(value){
    this.selectedEnclosure = this.system.profile[value];
    this.addViews();
  }

  extractVisualizations(){
    this.system.profile.forEach((item, index) => {
      if(this.system.rearIndex && item.enclosureKey == this.system.rearIndex){ return; }
      if(this.system.profile){  
        this.events.next({name:"CanvasExtract", data: this.system.profile[index], sender:this});
      }
    })
  }

  addViews(){
    let views = [];
    let disks =  { 
        name: 'Disks',
        alias: 'Disks',
        icon: "harddisk",
        id: 0,
        showInNavbar: true
    }
    
    views.unshift(disks);
    let matchIndex; 

    this.system.enclosures[this.selectedEnclosure.enclosureKey].elements.forEach((element, index) => {
      let view = { 
        name: element.name,
        alias: '',
        icon: "",
        id: views.length,
        elementIndex: index,
        showInNavbar: true
      }

      switch(element.name){
        case "Cooling" :
          view.alias = element.name;
          view.icon = "fan";
          views.push(view);
        break;
        case "Temperature Sensor" :
          view.alias = "Temperature";
          view.icon = "fan";
          views.push(view);
        break;
        case "Voltage Sensor" :
          view.alias = "Voltage";
          view.icon = "flash";
          views.push(view);
        break;
        case "Power Supply" :
          view.alias = element.name;
          view.icon = "flash";
          views.push(view);
        break;
        case "SAS Connector" :
          view.alias = "SAS";
          view.icon = "flash";
          views.push(view);
        break;
        case "Enclosure Services Controller Electronics":
          view.alias = "Services";
          view.icon = "flash";
          views.push(view);
        break;
      }

      if(view.alias == this.currentView.alias){ matchIndex = view.id;}
    });

    this.views = views;

    if(matchIndex && matchIndex > 0){
      this.currentView = views[matchIndex];
    } else {
      this.currentView = disks;
    }
  }

}
