import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ElementRef, ViewEncapsulation, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { DataSource } from '@angular/cdk/collections';
import { Observable ,  BehaviorSubject ,  Subscription } from 'rxjs';



import {iXObject} from 'app/core/classes/ix-object';
import { TranslateService } from '@ngx-translate/core';

//local libs
import { RestService } from '../../../../services/rest.service';
import { WebSocketService } from '../../../../services/ws.service';
import { DialogService } from '../../../../services/dialog.service';
import { EntityUtils } from '../utils';
import { AppLoaderService } from '../../../../services/app-loader/app-loader.service';

@Component({
  selector: 'entity-card',
  templateUrl: './entity-card.component.html',
  styleUrls: ['./entity-card.component.css'],
  providers: [DialogService]
})
export class EntityCardComponent extends iXObject implements OnInit {

  @Input('conf') conf: any;
  @Input() width: string;
  @Input() height: string;
  @Input() isFlipped = false;
  @Output() editCard: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() front: TemplateRef<any>;
  @Input() back: TemplateRef<any>;
  @Input() lazyLoaded: boolean = false;
  public actions: boolean = false;

  public busy: Subscription;

  public rows: Array < any > = [];
  public columns: Array < any > = [];
  public page: number = 1;
  public itemsPerPage: number = 10;
  public maxSize: number = 5;
  public numPages: number = 1;
  public length: number = 0;
  public config: any = {
    paging: true,
    sorting: { columns: this.columns },
  };
  protected loaderOpen: boolean = false;


  constructor(protected rest: RestService, protected ws: WebSocketService,  protected router: Router,
    protected _eRef: ElementRef, private dialog: DialogService, protected loader: AppLoaderService, 
    translate: TranslateService) {
    super()
  }

  ngOnInit() {
    if (this.conf.preInit) {
      this.conf.preInit(this);
    }
    //this.getData();
    if (this.conf.afterInit) {
      this.conf.afterInit(this);
    }
  }

  ngAfterViewInit(){
    if(this.conf){
      this.isFlipped = this.conf.isFlipped;
      //console.log("conf exists!!")
    } else {
      alert("conf doesn't exist!!");
    }
  }

  toggle(row: any) {

    let rpc: string;

    if (row[this.conf.toggleProp] !== this.conf.runnningState) {
      rpc = this.conf.toggleStart;
    } else {
      rpc = this.conf.toggleStop;
    }

    this.busy = this.ws.call(rpc, [ row.id ]).subscribe((res) => {
      if (res) {
        row[this.conf.toggleProp]= 'RUNNING';
      } else {
        row[this.conf.toggleProp] = 'STOPPED';
      }
    });
  }

  getData() {
    let offset = this.itemsPerPage * (this.page - 1);
    let sort: Array < String > = [];
    let options: Object = new Object();

    for (let i in this.config.sorting.columns) {
      let col = this.config.sorting.columns[i];
      if (col.sort == 'asc') {
        sort.push(col.name);
      } else if (col.sort == 'desc') {
        sort.push('-' + col.name);
      }
    }

    // options = {limit: this.itemsPerPage, offset: offset};
    options = { limit: 0 };
    if (sort.length > 0) {
      options['sort'] = sort.join(',');
    }

    /* if we want to use this we will need to convert to websocket
    this.busy =
      this.rest.get(this.conf.resource_name, options).subscribe((res) => {
        if (this.loaderOpen) {
          this.loader.close();
          this.loaderOpen = false;
        }
        this.length = res.total;
        this.rows = new EntityUtils().flattenData(res.data);
        if (this.conf.dataHandler) {
          this.conf.dataHandler(this);
        }
      });*/
  }

  onChangeTable(
    config,
    page: any = { page: this.page, itemsPerPage: this.itemsPerPage }) {
    if (config.filtering) {
      Object.assign(this.config.filtering, config.filtering);
    }
    if (config.sorting) {
      Object.assign(this.config.sorting, config.sorting);
    }
    this.page = page.page;
    this.getData();
  }

  trClass(row) {
    let classes = [];
    classes.push('treegrid-' + row.id);
    if (row._parent) {
      classes.push('treegrid-parent-' + row._parent);
    }
    return classes.join(' ');
  }

  getCardActions(row) {
    if (this.conf.cardActions) {
      this.actions = true;
      return this.conf.cardActions;
    } else {
      this.actions = false;
      /*
      return [{
        id: "edit",
        label: "Edit",
	onClick: (row) => {
	  this.editCard.emit(true);
	  this.toggleFlip();
	  this.lazyLoaded = true;
	  //this.conf.isFlipped = true;
	},
      }]*/
    }
  }

  getAddActions() {
    if (this.conf.getAddActions) {
      return this.conf.getAddActions();
    } else {
      return [];
    }
  }

  rowValue(row, attr) {
    if (this.conf.rowValue) {
      return this.conf.rowValue(row, attr);
    }
    return row[attr];
  }

  doAdd() {
    this.router.navigate(new Array('/').concat(this.conf.route_add));
  }

  doSave() {
    this.toggleFlip();
    /*
    this.router.navigate(
      new Array('/').concat(this.conf.route_edit).concat(id)
    );
    */
  }

  doDelete() {

    this.dialog.confirm("Delete", "Delete this item?").subscribe((res) => {
      if (res) {
	/*
        this.loader.open();
        this.loaderOpen = true;
        let data = {};
        this.busy = this.rest.delete(this.conf.resource_name + '/' + id, data).subscribe(
          (res) => {
            this.getData();
          },
          (res) => { new EntityUtils().handleError(this, res); this.loader.close();}
        );
	*/
      }
    })

    this.toggleFlip();
  }
  toggleFlip(){
  this.conf.isFlipped = !this.conf.isFlipped;
  }
}
