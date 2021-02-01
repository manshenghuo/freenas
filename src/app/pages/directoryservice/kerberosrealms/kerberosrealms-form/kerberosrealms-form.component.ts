import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';

import { FieldConfig } from '../../../common/entity/entity-form/models/field-config.interface';
import { FieldSet } from 'app/pages/common/entity/entity-form/models/fieldset.interface';
import helptext from '../../../../helptext/directoryservice/kerberosrealms-form-list';
import global_helptext from '../../../../helptext/global-helptext';

@Component({
  selector: 'app-group-form',
  template: `<entity-form [conf]="this"></entity-form>`
})
export class KerberosRealmsFormComponent {

  protected route_success: string[] = ['directoryservice', 'kerberosrealms'];
  protected addCall = 'kerberos.realm.create';
  protected editCall = 'kerberos.realm.update';
  protected queryCall = 'kerberos.realm.query';
  protected pk: any;
  protected isNew = true;
  protected queryKey = 'id';
  protected isEntity = true;
  protected isBasicMode = true;

  protected fieldConfig: FieldConfig[] = []
  public fieldSets: FieldSet[] = [
    {
      name: helptext.kerb_form_heading,
      class: 'heading',
      label:true,
      config:[
        {
          type: 'input',
          name: helptext.krbrealm_form_realm_name,
          placeholder: helptext.krbrealm_form_realm_placeholder,
          tooltip: helptext.krbrealm_form_realm_tooltip,
          required: true,
          validation : helptext.krbrealm_form_realm_validation
        },
        {
          type: 'chip',
          name: helptext.krbrealm_form_kdc_name,
          placeholder: helptext.krbrealm_form_kdc_placeholder,
          tooltip: `${helptext.krbrealm_form_kdc_tooltip} ${helptext.multiple_values}`
        },
        {
          type: 'chip',
          name: helptext.krbrealm_form_admin_server_name,
          placeholder: helptext.krbrealm_form_admin_server_placeholder,
          tooltip: `${helptext.krbrealm_form_admin_server_tooltip} ${helptext.multiple_values}`
        },
        {
          type: 'chip',
          name: helptext.krbrealm_form_kpasswd_server_name,
          placeholder: helptext.krbrealm_form_kpasswd_server_placeholder,
          tooltip: `${helptext.krbrealm_form_kpasswd_server_tooltip} ${helptext.multiple_values}`
        }
      ]
    }
  ];

  protected advanced_field: Array < any > = helptext.krbrealm_form_advanced_field_array;

  public custActions: Array < any > = [{
      id: helptext.krbrealm_form_custactions_basic_id,
      name: global_helptext.basic_options,
      function: () => { this.isBasicMode = !this.isBasicMode; }
    },
    {
      'id': helptext.krbrealm_form_custactions_adv_id,
      name: global_helptext.advanced_options,
      function: () => { this.isBasicMode = !this.isBasicMode; }
    }
  ];

  constructor(private router: Router, protected aroute: ActivatedRoute) {}

  preInit() {
    this.aroute.params.subscribe(params => {
      if (params.pk) {
        this.pk = parseInt(params.pk);
        this.isNew = false;
      }
    })
  }

  isCustActionVisible(actionId: string) {
    if (actionId === 'advanced_mode' && this.isBasicMode === false) {
      return false;
    } else if (actionId === 'basic_mode' && this.isBasicMode === true) {
      return false;
    }
    return true;
  }

}
