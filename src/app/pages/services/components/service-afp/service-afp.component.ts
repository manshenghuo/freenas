import { ApplicationRef, Component, Injector } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';

import { RestService, UserService, WebSocketService, IscsiService } from '../../../../services/';
import { FieldConfig } from '../../../common/entity/entity-form/models/field-config.interface';
import helptext from '../../../../helptext/services/components/service-afp';
import { FieldSet } from 'app/pages/common/entity/entity-form/models/fieldset.interface';

@Component({
  selector : 'afp-edit',
  template : ` <entity-form [conf]="this"></entity-form>`,
  providers : [ UserService, IscsiService ]
})

export class ServiceAFPComponent {
  protected route_success: string[] = [ 'services' ];
  protected queryCall = 'afp.config';
  public title = helptext.formTitle;

  public fieldConfig: FieldConfig[] = [];
  
  public fieldSets: FieldSet[] = [
    {
      name: helptext.afp_fieldset_path,
      label: true,
      config: [{
          type : 'explorer',
          initial: '/mnt',
          explorerType: 'directory',
          name : 'dbpath',
          placeholder : helptext.afp_srv_dbpath_placeholder,
          tooltip: helptext.afp_srv_dbpath_tooltip,
      }]
    },
    {
      name: 'divider',
      divider: true
    },
    {
      name: helptext.afp_fieldset_access,
      label: true,
      width: '49%',
      config: [
        {
          type : 'select',
          name : 'guest_user',
          placeholder : helptext.afp_srv_guest_user_placeholder,
          tooltip: helptext.afp_srv_guest_user_tooltip,
          options: helptext.afp_srv_guest_user_options
        },
        {
          type : 'checkbox',
          name : 'guest',
          placeholder : helptext.afp_srv_guest_placeholder,
          tooltip: helptext.afp_srv_guest_tooltip,
        },
        {
          type : 'input',
          name : 'connections_limit',
          placeholder : helptext.afp_srv_connections_limit_placeholder,
          tooltip: helptext.afp_srv_connections_limit_tooltip,
        },
        {
          type : 'select',
          name : 'chmod_request',
          placeholder : helptext.afp_srv_chmod_request_placeholder,
          tooltip: helptext.afp_srv_chmod_request_tooltip,
          options : helptext.afp_srv_chmod_request_options,
        },
        {
          type : 'select',
          name : 'map_acls',
          placeholder : helptext.afp_srv_map_acls_placeholder,
          tooltip: helptext.afp_srv_map_acls_tooltip,
          options : helptext.afp_srv_map_acls_options,
        }
      ]
    },
    { name: 'vertical-spacer', width: '2%'},
    {
      name: helptext.afp_fieldset_other,
      label: true,
      width: '49%',
      config: [
        {
          type: 'select',
          name: 'loglevel',
          placeholder: helptext.loglevel.placeholder,
          tooltip: helptext.loglevel.tooltip,
          options: helptext.loglevel.options
        },
        {
          type : 'select',
          name : 'bindip',
          placeholder : helptext.afp_srv_bindip_placeholder,
          tooltip: helptext.afp_srv_bindip_tooltip,
          options: [],
          multiple: true
        },
        {
          type : 'textarea',
          name : 'global_aux',
          placeholder : helptext.afp_srv_global_aux_placeholder,
          tooltip: helptext.afp_srv_global_aux_tooltip,
        }
      ]
    },
    {
      name: 'divider',
      divider: true
    }
  ];

  private guest_users: any;
  private bindip: any;
  private validBindIps: any;

  constructor(protected router: Router, protected route: ActivatedRoute,
              protected rest: RestService, protected ws: WebSocketService,
              protected _injector: Injector, protected _appRef: ApplicationRef,
              protected userService: UserService, protected iscsiService: IscsiService,) {}

  resourceTransformIncomingRestData(data) {
    // If validIps is slow to load, skip check on load (It's still done on save)
    if(this.validBindIps && Object.keys(this.validBindIps).length !== 0) {
      return this.compareBindIps(data);
    }
    return data;
  }

  compareBindIps(data) {
    // Weeds out invalid addresses (ie, ones that have changed). Called on load and on save.
    data.bindip = data.bindip ? data.bindip : [];
    if(this.validBindIps && Object.keys(this.validBindIps).length !== 0) {
      data.bindip.forEach(ip => {
        if (!Object.values(this.validBindIps).includes(ip)) {
          data.bindip.splice(data.bindip[ip], 1)
        }
      })
    } else {
      data.bindip = [];
    }
    return data;
  }
  
  afterInit(entityEdit: any) {
    entityEdit.submitFunction = this.submitFunction;
    let self = this;
    this.userService.listUsers().subscribe((res) => {
      self.guest_users =
        _.find(this.fieldSets, { name : helptext.afp_fieldset_access }).config.find(config => config.name === 'guest_user');
      for (let i = 0; i < res.data.length; i++) {
        this.guest_users.options.push(
          { label : res.data[i].bsdusr_username, value : res.data[i].bsdusr_username }
        );
      }
    });
    this.ws.call('afp.bindip_choices').subscribe((res) => {
      this.validBindIps = res;
      this.bindip =
        _.find(this.fieldSets, { name: helptext.afp_fieldset_other }).config.find(config => config.name === 'bindip');
      Object.keys(res || {}).forEach(key => {
        const ip = res[key];
        this.bindip.options.push({ label: ip, value: ip });
      });
    });
  }

  submitFunction(this: any, body: any){
    return this.ws.call('afp.update', [body]);
  }

  beforeSubmit(data) {
    data = this.compareBindIps(data);
  }
}
