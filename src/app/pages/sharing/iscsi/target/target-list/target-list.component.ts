import { Component, Input, OnInit } from '@angular/core';

import { IscsiService } from '../../../../../services/iscsi.service';
import { T } from 'app/translate-marker';
import { EntityUtils } from '../../../../common/entity/utils';

@Component({
  selector : 'app-iscsi-target-list',
  template : `
    <entity-table [conf]="this" [title]="tableTitle"></entity-table>
  `,
  providers: [IscsiService]
})
export class TargetListComponent implements OnInit{
  @Input('fcEnabled') fcEnabled: boolean;

  public tableTitle = "Targets";
  protected queryCall = 'iscsi.target.query';
  protected wsDelete = 'iscsi.target.delete';
  protected route_add: string[] = [ 'sharing', 'iscsi', 'target', 'add' ];
  protected route_add_tooltip: string = "Add Target";
  protected route_edit: string[] = [ 'sharing', 'iscsi', 'target', 'edit' ];

  public columns: Array<any> = [
    {
      name : T('Target Name'),
      prop : 'name',
      always_display: true
    },
    {
      name : T('Target Alias'),
      prop : 'alias',
    },
  ];
  public config: any = {
    paging : true,
    sorting : {columns : this.columns},
    deleteMsg: {
      title: 'Target',
      key_props: ['name']
    },
  };

  protected entityList: any;
  constructor(private iscsiService: IscsiService) {}

  ngOnInit() {
    if (this.fcEnabled) {
      this.columns.push({
        name : T('Mode'),
        prop : 'mode',
      });
    }
  }

  afterInit(entityList: any) {
    this.entityList = entityList;
  }

  getActions(row) {
    return [{
      id: row.name,
      icon: 'edit',
      name: "edit",
      label: T("Edit"),
      onClick: (rowinner) => { this.entityList.doEdit(rowinner.id); },
    }, {
      id: row.name,
      icon: 'delete',
      name: "delete",
      label: T("Delete"),
      onClick: (rowinner) => {
        let deleteMsg = this.entityList.getDeleteMessage(rowinner);
        this.iscsiService.getGlobalSessions().subscribe(
          (res) => {
            const payload = [rowinner.id];
            let warningMsg = '';
            for (let i = 0; i < res.length; i++) {
              if (res[i].target.split(':')[1] == rowinner.name) {
                warningMsg = '<font color="red">' + T('Warning: iSCSI Target is already in use.</font><br>');
                payload.push(true); // enable force delele
                break;
              }
            }
            deleteMsg = warningMsg + deleteMsg;

            this.entityList.dialogService.confirm( T("Delete"), deleteMsg, false, T("Delete")).subscribe((dialres) => {
              if (dialres) {
                this.entityList.loader.open();
                this.entityList.loaderOpen = true;
                this.entityList.ws.call(this.wsDelete, payload).subscribe(
                  (resinner) => { this.entityList.getData() },
                  (resinner) => {
                    new EntityUtils().handleWSError(this, resinner, this.entityList.dialogService);
                    this.entityList.loader.close();
                  }
                );
              }
            });
          }
        )
      }
    }];
  }
}
