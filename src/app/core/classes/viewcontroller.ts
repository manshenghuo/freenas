import { Subject } from 'rxjs';
import { CoreEvent } from 'app/core/services/core.service';
import { View } from 'app/core/classes/view';
import { Action } from 'app/core/classes/viewcontrol';

export interface ViewControllerOptions {
  events: Subject<CoreEvent>;
}

export abstract class ViewController {

  public name: string = "ViewController";
  protected controlEvents: Subject<CoreEvent>;

  constructor(options?: ViewControllerOptions) {
    if(options){
      this.setControlEvents(options.events);
    } else {
      this.setControlEvents();
    }
  }

  public setControlEvents(subj?:Subject<CoreEvent>){
    if(subj){
      this.controlEvents = subj;
    } else {
      this.controlEvents = new Subject();
    }
  } 
}
