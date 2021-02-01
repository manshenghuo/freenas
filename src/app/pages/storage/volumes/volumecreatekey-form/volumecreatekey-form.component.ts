import {
  ApplicationRef,
  Component,
  Injector
} from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';

import { WebSocketService } from '../../../../services/';
import { EncryptionService } from '../../../../../app/services/encryption.service';
import {
  FieldConfig
} from '../../../common/entity/entity-form/models/field-config.interface';
import { DialogService } from 'app/services/dialog.service';
import { MatDialog } from '@angular/material/dialog';
import { Formconfiguration } from 'app/pages/common/entity/entity-form/entity-form.component';
import { AppLoaderService } from '../../../../services/app-loader/app-loader.service';
import { T } from '../../../../translate-marker';
import helptext from '../../../../helptext/storage/volumes/volume-key';

@Component({
  selector : 'app-createpassphrase-form',
  template : `<entity-form [conf]="this"></entity-form>`
})
export class VolumeCreatekeyFormComponent implements Formconfiguration {

  saveSubmitText = T("Create Passphrase");

  queryCall = 'pool.query';
  queryKey = 'id';
  route_return: string[] = [ 'storage', 'pools'];
  isNew = false;
  isEntity = true;
  poolName: string;
  admin_pw = '';
  entityData = {
    name: "",
    passphrase: "",
    passphrase2: ""
  };

  fieldConfig: FieldConfig[] = [
    {
      type : 'input',
      name : 'name',
      isHidden: true
    },{
      type: 'paragraph',
      name: 'encrypt-headline',
      paraText: '<i class="material-icons">lock</i>' + helptext.changekey_headline
    },{
      type: 'paragraph',
      name: 'createkey-instructions',
      paraText: helptext.changekey_instructions
    },{
      type : 'input',
      inputType: 'password',
      togglePw : true,
      name : 'adminpw',
      placeholder: helptext.changekey_adminpw_placeholder,
      tooltip: helptext.changekey_adminpw_tooltip,
      validation: helptext.changekey_adminpw_validation,
      required: true
    },{
      type : 'input',
      inputType: 'password',
      name : 'passphrase',
      placeholder: helptext.createkey_passphrase_placeholder,
      tooltip: helptext.createkey_passphrase_tooltip,
      validation: helptext.createkey_passphrase_validation,
      required: true,
      togglePw: true
    }
  ];

  public custActions: Array<any> = [
    {
      id : 'download_encrypt_key',
      name : T('Download Encryption Key'),
      disabled: true,
      function : () => {
        this.ws.call('auth.check_user', ['root', this.admin_pw]).subscribe((res) => {
          if (res) {
            this.encryptionService.openEncryptDialog(this.pk, this.route_return, this.poolName);
          } else {
            this.dialogService.Info('Error', 'The administrator password is incorrect.', '340px')
          }
        })
      }
    },
    {
      id : 'custom_cancel',
      name : T('Cancel'),
      function : () => {
        this.router.navigate(new Array('/').concat(
          this.route_return));
    }
  }];

  resourceTransformIncomingRestData(data:any): any {
    this.poolName = data.name;
    _.find(this.fieldConfig, {name : "encrypt-headline"}).paraText += ` <em>${this.poolName}</em>`;
    return data;
  };

  pk: any;
  constructor(
      protected router: Router,
      protected route: ActivatedRoute,
      protected ws: WebSocketService,
      protected _injector: Injector,
      protected _appRef: ApplicationRef,
      protected dialogService: DialogService,
      protected loader: AppLoaderService,
      private mdDialog: MatDialog,
      private encryptionService: EncryptionService
  ) {}

  preInit(entityForm: any) {
    this.route.params.subscribe(params => {
      this.pk = params['pk'];
    });
  }

  afterInit(entityForm: any) {
    entityForm.formGroup.controls['adminpw'].valueChanges.subscribe((res) => {
      this.admin_pw = res;
      let btn = <HTMLInputElement> document.getElementById('cust_button_Download Encryption Key')
      this.admin_pw !== '' ? btn.disabled = false : btn.disabled = true;
    })
  }

  customSubmit(value) {
    this.ws.call('auth.check_user', ['root', value.adminpw]).subscribe((res) => {
      if (res) {
        this.encryptionService.setPassphrase(this.pk, value.passphrase, value.adminpw, 
          value.name, this.route_return, false, true, 'created for');
      } else {
        this.dialogService.Info('Error', 'The administrator password is incorrect.', '340px');
      }
    });
 }

}
