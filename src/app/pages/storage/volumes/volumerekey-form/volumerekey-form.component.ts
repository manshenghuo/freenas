import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import * as _ from 'lodash';
import { WebSocketService, AppLoaderService, DialogService } from '../../../../services/';
import { FieldConfig } from '../../../common/entity/entity-form/models/field-config.interface';
import { Formconfiguration } from 'app/pages/common/entity/entity-form/entity-form.component';
import { EncryptionService } from '../../../../../app/services/encryption.service';
import { T } from '../../../../translate-marker';
import helptext from '../../../../helptext/storage/volumes/volume-key';

@Component({
  selector: 'app-volumeunlock-form',
  template: `<entity-form [conf]="this"></entity-form>`
})
export class VolumeRekeyFormComponent implements Formconfiguration {

  saveSubmitText = T("Reset Encryption");

  queryCall = 'pool.query';
  queryKey = 'id';
  route_success: string[] = ['storage', 'pools'];
  isNew = false;
  isEntity = true;
  poolName: string;
  entityData = {
    name: "",
    passphrase: ""
  };

  fieldConfig: FieldConfig[] = [
    {
      type: 'input',
      name: 'name',
      isHidden: true
    }, {
      type: 'paragraph',
      name: 'encrypt-headline',
      paraText: '<i class="material-icons">lock</i>' + helptext.rekey_headline
    },{
      type: 'paragraph',
      name: 'rekey-instructions',
      paraText: helptext.rekey_instructions
    }, {
      type: 'input',
      inputType: 'password',
      name: 'passphrase',
      label: helptext.rekey_password_label,
      placeholder: helptext.rekey_password_placeholder,
      tooltip: helptext.rekey_password_tooltip,
      validation: helptext.rekey_password_validation,
      required: true,
      togglePw : true
    },{
      type: 'paragraph',
      name: 'encryptionkey-passphrase-instructions',
      paraText: helptext.encryptionkey_passphrase_instructions
    },{
      type : 'input',
      inputType: 'password',
      name : 'encryptionkey_passphrase',
      placeholder: helptext.encryptionkey_passphrase_placeholder,
      tooltip: helptext.encryptionkey_passphrase_tooltip,
      togglePw : true
    },{
      type: 'paragraph',
      name: 'set_recoverykey-instructions'
    },{
      type : 'checkbox',
      name : 'set_recoverykey',
      placeholder: helptext.set_recoverykey_checkbox_placeholder,
      tooltip: helptext.set_recoverykey_checkbox_tooltip,
      disabled: true
    }
  ];

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
      protected dialogService: DialogService,
      protected loader: AppLoaderService,
      protected mdDialog: MatDialog,
      protected encryptionService: EncryptionService
  ) {}

  preInit(entityForm: any) {
    this.route.params.subscribe(params => {
      this.pk = params['pk'];
    });
  }

  afterInit(entityForm: any) {
    entityForm.formGroup.controls['encryptionkey_passphrase'].valueChanges.subscribe((res) => {
      let instructions = _.find(this.fieldConfig, {'name' : 'set_recoverykey-instructions'});
      let field = _.find(this.fieldConfig, {'name' : 'set_recoverykey'});
      res !== '' ? entityForm.setDisabled('set_recoverykey', false) : entityForm.setDisabled('set_recoverykey', true);
    })
  }
 
  customSubmit(value) {
    this.ws.call('auth.check_user', ['root', value.passphrase]).subscribe((res) => {
      if (!res) {
        this.dialogService.Info('Error', 'The administrator password is incorrect.', '340px');
      } else {
        this.ws.call('pool.rekey', [parseInt(this.pk), {'admin_password': value.passphrase}])
        .subscribe(() => {
          switch (true) 
            {
              case value.encryptionkey_passphrase && !value.set_recoverykey:
                this.encryptionService.setPassphrase(this.pk, value.encryptionkey_passphrase, 
                  value.passphrase, value.name, this.route_success,false);
                break;
  
              case !value.encryptionkey_passphrase && value.set_recoverykey:
                this.encryptionService.openEncryptDialog(this.pk, this.route_success, value.name, true);
                break;
  
              case value.encryptionkey_passphrase && value.set_recoverykey:
                  this.encryptionService.setPassphrase(this.pk, value.encryptionkey_passphrase, 
                    value.passphrase, value.name, this.route_success, true, true);
                break;
  
              default:
                this.dialogService.Info(T('Success'), T('Successfully reset encryption for pool: ') + value.name);
                this.encryptionService.openEncryptDialog(this.pk, this.route_success, this.poolName);
            }
        },
        (err) => {
          this.dialogService.errorReport(T("Error resetting encryption for pool: " + value.name), err.reason, err.trace.formatted);
        });       
      }
    });
  }
}
