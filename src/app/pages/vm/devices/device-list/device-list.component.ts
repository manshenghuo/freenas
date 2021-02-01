import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { RestService, WebSocketService } from '../../../../services/';
import { DialogService } from '../../../../services/dialog.service';

import { AppLoaderService } from '../../../../services/app-loader/app-loader.service';
import { EntityUtils } from '../../../common/entity/utils';
import { ChangeDetectorRef } from '@angular/core';
import { T } from '../../../../translate-marker';
import { DialogFormConfiguration } from '../../../common/entity/entity-dialog/dialog-form-configuration.interface';
import * as _ from 'lodash';

@Component({
  selector : 'app-device-list',
  template : `
  <entity-table [title]="title" [conf]="this"></entity-table>
  `
})
export class DeviceListComponent {

  protected resource_name: string;
  protected route_add: string[];
  protected route_edit: string[];
  protected route_delete: string[];
  protected pk: any;
  public vm: string;
  public sub: Subscription;
  private entityList: any;
  public  wsDelete = 'datastore.delete';
  public queryCall = 'vm.device.query';
  protected queryCallOption: Array<any> = [[['vm', '=']]];
  public busy: Subscription;
  protected loaderOpen = false;
  public columns: Array<any> = [
    {name: T('Device ID'), prop:'id', always_display: true},
    {name : T('Device'), prop : 'dtype'},
    {name : T('Order'), prop : 'order'},
  ];
  public rowIdentifier = 'id';
  public title = T("VM ");
  public config: any = {
    paging : true,
    sorting : {columns : this.columns},
  };

  protected globalConfig = {
    id: "config",
    tooltip: T('Close (return to VM list'),
    icon: 'highlight_off',
    onClick: () => {
      this.router.navigate(new Array('').concat(['vm']));
    }
  };

  constructor(protected router: Router, protected aroute: ActivatedRoute,
              protected rest: RestService, protected ws: WebSocketService, protected loader: AppLoaderService,
              public dialogService: DialogService, private cdRef:ChangeDetectorRef,
              private translate: TranslateService) {}


  isActionVisible(actionId: string, row: any) {
    return actionId === 'delete' && row.id === true ? false : true;
  }

  getActions(row) {
    const self = this;
        const actions = [];
        actions.push({
          id: row.id,
          name: 'edit',
          icon: 'edit',
          label : T("Edit"),
          onClick : (edit_row) => {
            this.router.navigate(new Array('').concat(
                [ "vm", this.pk, "devices", this.vm, "edit", edit_row.id, edit_row.dtype ]));
          }
        });
        actions.push({
          id: row.id,
          name: 'delete',
          icon: 'delete',
          label : T("Delete"),
          onClick : (delete_row) => {
            this.deviceDelete(delete_row);
          },
        });
        actions.push({
          id: row.id,
          name: 'reorder',
          icon: 'reorder',
          label : T("Change Device Order"),
          onClick : (row1) => {
            self.translate.get('Change order for ').subscribe(orderMsg => {
              const conf: DialogFormConfiguration = { 
                title: T('Change Device Order'),
                message: orderMsg + `<b>${row1.dtype} ${row1.id}</b>`,
                parent: this,
                fieldConfig: [{
                  type: 'input',
                  name: 'order',
                }
              ],
                saveButtonText: T('Save'),
                preInit: function (entityDialog) {
                  _.find(entityDialog.fieldConfig, {'name':'order'})['value'] = row1.order;
                },
                customSubmit: function (entityDialog) {
                  const value = entityDialog.formValue;
                  self.loader.open();
                  self.ws.call('vm.device.update',[row1.id,{'order':value.order}]).subscribe((succ)=>{
                    entityDialog.dialogRef.close(true);
                    self.loader.close();
                    this.parent.entityList.getData();
                  },(err)=>{
                    self.loader.close();
                  },()=>{
                    entityDialog.dialogRef.close(true);
                    self.loader.close();
                    this.parent.entityList.getData();
                  });
    
                }
              }
              self.dialogService.dialogForm(conf);
            })

            }
          }),
          actions.push({
            id: row.id,
            name: 'details',
            icon: 'list',
            label : T("Details"),
            onClick : (device) => {
              self.translate.get('Change order for ').subscribe(detailMsg => {
                let details = ``
                for (const attribute in device.attributes) {
                  details = `${attribute}: ${device.attributes[attribute]} \n` + details;
                }
                this.dialogService.Info(detailMsg + `${row.dtype} ${row.id}`, details,'500px','info');
              })
            },
          });
        return actions;
    }
  
  deviceDelete(row){
    this.translate.get('Delete').subscribe(msg => {
      this.dialogService.confirm(T("Delete"), `${msg} <b>${row.dtype} ${row.id}</b>`, 
      true, T('Delete Device')).subscribe((res) => {
      if (res) {
        this.loader.open();
        this.loaderOpen = true;
        const data = {};
        if (this.wsDelete) {
          this.busy = this.ws.call(this.wsDelete, ['vm.device',row.id]).subscribe(
            (resinner) => {
              this.entityList.getData();
              this.loader.close();
            },
            (resinner) => {
              new EntityUtils().handleError(this, resinner);
              this.loader.close();
            }
          );
        }
      }
    })
    })
  }
  preInit(entityList: any) {
    this.entityList = entityList;
    this.sub = this.aroute.params.subscribe(params => {
      this.pk = params['pk'];
      this.vm = params['name'];
      this.route_add = ['vm', this.pk, 'devices', this.vm, 'add'];
      this.route_edit = [ 'vm', this.pk, 'devices', this.vm, 'edit' ];
      this.route_delete = [ 'vm', this.pk, 'devices', this.vm, 'delete' ];
      // this is filter by vm's id to show devices belonging to that VM
      this.resource_name = 'vm/device/?vm__id=' + this.pk;
      this.title = this.title + this.vm + ' devices';
      this.cdRef.detectChanges();
      this.queryCallOption[0][0].push(parseInt(this.pk,10));
    });
  }
}
