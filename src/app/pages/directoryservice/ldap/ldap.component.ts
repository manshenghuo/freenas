import {ApplicationRef, Component, Injector, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import * as _ from 'lodash';

import {
  SystemGeneralService,
  WebSocketService
} from '../../../services/';
import {
  FieldConfig
} from '../../common/entity/entity-form/models/field-config.interface';
import { FieldSet } from 'app/pages/common/entity/entity-form/models/fieldset.interface';
import {  DialogService } from '../../../services/';
import helptext from '../../../helptext/directoryservice/ldap';
import global_helptext from '../../../helptext/global-helptext';

@Component({
  selector : 'app-ldap',
  template : '<entity-form [conf]="this"></entity-form>',
})

export class LdapComponent {
  protected isEntity = false;
  protected queryCall: string = 'ldap.config';
  protected upodateCall: string = 'ldap.update';
  protected isBasicMode = true;
  protected idmapBacked: any;
  protected ldap_kerberos_realm: any;
  protected ldap_kerberos_principal: any;
  protected ldap_ssl: any;
  protected ldapCertificate: any;
  protected ldap_schema: any;
  protected ldap_hostname: any;
  protected entityForm: any;
  public custActions: Array<any> = [
    {
      id : helptext.ldap_custactions_basic_id,
      name : global_helptext.basic_options,
      function : () => { 
        this.isBasicMode = !this.isBasicMode; 
        this.fieldSets.find(set => set.name === helptext.ldap_advanced).label = false;
        this.fieldSets.find(set => set.name === 'divider').divider = false;
      }
    },
    {
      id : helptext.ldap_custactions_advanced_id,
      name : global_helptext.advanced_options,
      function : () => { 
        this.isBasicMode = !this.isBasicMode; 
        this.fieldSets.find(set => set.name === 'Advanced Settings').label = true;
        this.fieldSets.find(set => set.name === 'divider').divider = true;
      }
    },
    {
      id : helptext.ldap_custactions_edit_imap_id,
      name : helptext.ldap_custactions_edit_imap_name,
      function : () => {
        this.router.navigate(new Array('').concat(['directoryservice','idmap']));
      }
    },
    {
      'id' : helptext.ldap_custactions_clearcache_id,
      'name' : helptext.ldap_custactions_clearcache_name,
       function : async () => {
        this.systemGeneralService.refreshDirServicesCache().subscribe((cache_status)=>{
          this.dialogservice.Info(helptext.ldap_custactions_clearcache_dialog_title,
            helptext.ldap_custactions_clearcache_dialog_message);

        })
      }
    },
  ];

  public fieldConfig: FieldConfig[] = [];
  public fieldSets: FieldSet[] = [
    {      
      name: helptext.ldap_server_creds,
      class: 'section_header',
      label:true,
      config:[
        {
          type : 'chip',
          name : helptext.ldap_hostname_name,
          placeholder : helptext.ldap_hostname_placeholder,
          tooltip: helptext.ldap_hostname_tooltip,
          required: true,
          validation: helptext.ldap_hostname_validation
        },
        {
          type : 'chip',
          name : helptext.ldap_hostname_noreq_name,
          placeholder : helptext.ldap_hostname_noreq_placeholder,
          tooltip: helptext.ldap_hostname_noreq_tooltip
        },
        {
          type : 'input',
          name : helptext.ldap_basedn_name,
          placeholder : helptext.ldap_basedn_placeholder,
          tooltip: helptext.ldap_basedn_tooltip
        },
        {
          type : 'input',
          name : helptext.ldap_binddn_name,
          placeholder : helptext.ldap_binddn_placeholder,
          tooltip: helptext.ldap_binddn_tooltip
        },
        {
          type : 'input',
          name : helptext.ldap_bindpw_name,
          placeholder : helptext.ldap_bindpw_placeholder,
          tooltip: helptext.ldap_bindpw_tooltip,
          inputType : 'password',
          togglePw : true
        },
        {
          type : 'checkbox',
          name : helptext.ldap_enable_name,
          placeholder : helptext.ldap_enable_placeholder,
          tooltip: helptext.ldap_enable_tooltip
        }
      ]
    },
    {      
      name:'divider',
      divider:false
    },
    {      
      name: helptext.ldap_advanced,
      class: 'section',
      label:false,
      config:[]},
    {      
      name: 'section_two',
      class: 'section_header',
      label:false,
      width: '48%',
      config:[
        {
          type : 'checkbox',
          name : helptext.ldap_anonbind_name,
          placeholder : helptext.ldap_anonbind_placeholder,
          tooltip: helptext.ldap_anonbind_tooltip
        },
        {
          type : 'select',
          name : helptext.ldap_kerberos_realm_name,
          placeholder : helptext.ldap_kerberos_realm_placeholder,
          tooltip: helptext.ldap_kerberos_realm_tooltip,
          options : [{label: '---', value: null}]
        },
        {
          type : 'select',
          name : helptext.ldap_kerberos_principal_name,
          placeholder : helptext.ldap_kerberos_principal_placeholder,
          tooltip: helptext.ldap_kerberos_principal_tooltip,
          options : [{label: '---', value: ''}]
        },
        {
          type : 'select',
          name : helptext.ldap_ssl_name,
          placeholder : helptext.ldap_ssl_placeholder,
          tooltip: helptext.ldap_ssl_tooltip,
          options : []
        },
        {
          type : 'select',
          name : helptext.ldap_certificate_name,
          placeholder : helptext.ldap_certificate_placeholder,
          tooltip: helptext.ldap_certificate_tooltip,
          options : [{label: '---', value: null}]
        },
        {
          type : 'checkbox',
          name : 'validate_certificates',
          placeholder : helptext.ldap_validate_certificates_placeholder,
          tooltip : helptext.ldap_validate_certificates_tooltip,
        },
        {
          type : 'checkbox',
          name : helptext.ldap_disable_fn_cache_name,
          placeholder : helptext.ldap_disable_fn_cache_placeholder,
          tooltip: helptext.ldap_disable_fn_cache_tooltip
        }
      ]
    },
    {      
    name: 'section_2.5',
    class: 'section',
    label:false,
    width: '4%',
    config:[]},
    {      
      name: 'section_three',
      class: 'section_header',
      label:false,
      width: '48%',
      config:[
        {
          type : 'input',
          name : helptext.ldap_timeout_name,
          placeholder : helptext.ldap_timeout_placeholder,
          tooltip: helptext.ldap_timeout_tooltip
        },
        {
          type : 'input',
          name : helptext.ldap_dns_timeout_name,
          placeholder : helptext.ldap_dns_timeout_placeholder,
          tooltip: helptext.ldap_dns_timeout_tooltip
        },
        {
          type : 'checkbox',
          name : helptext.ldap_has_samba_schema_name,
          placeholder : helptext.ldap_has_samba_schema_placeholder,
          tooltip: helptext.ldap_has_samba_schema_tooltip
        },
        {
          type : 'textarea',
          name : helptext.ldap_auxiliary_parameters_name,
          placeholder : helptext.ldap_auxiliary_parameters_placeholder,
          tooltip: helptext.ldap_auxiliary_parameters_tooltip
        },
        {
          type : 'select',
          name : helptext.ldap_schema_name,
          placeholder : helptext.ldap_schema_placeholder,
          tooltip: helptext.ldap_schema_tooltip,
          options : []
        }
      ]
    }
  ];

  protected advanced_field: Array<any> = helptext.ldap_advanced_fields;

  isCustActionVisible(actionId: string) {
    if (actionId === 'advanced_mode' && this.isBasicMode === false) {
      return false;
    } else if (actionId === 'basic_mode' && this.isBasicMode === true) {
      return false;
    } else if (actionId === 'edit_idmap' && this.isBasicMode === true) {
      return false;
    }
    return true;
  }

  constructor(protected router: Router, protected route: ActivatedRoute,
              protected ws: WebSocketService, private dialogservice: DialogService,
              protected _injector: Injector, protected _appRef: ApplicationRef,
              protected systemGeneralService: SystemGeneralService) {}

  resourceTransformIncomingRestData(data) {
    delete data['bindpw'];
    data['hostname_noreq'] = data['hostname'];
    this.ldap_hostname = data['hostname'];
    return data;
  }
  
  afterInit(entityEdit: any) {
    this.entityForm = entityEdit;

    this.ws.call('kerberos.realm.query').subscribe((res) => {
      this.ldap_kerberos_realm = _.find(this.fieldConfig, {name : 'kerberos_realm'});
      res.forEach((item) => {
        this.ldap_kerberos_realm.options.push(
          {label : item.realm, value : item.id});        
      })
    })

    this.ws.call('kerberos.keytab.kerberos_principal_choices').subscribe((res) => {
      this.ldap_kerberos_principal = _.find(this.fieldConfig, {name : 'kerberos_principal'});
      res.forEach((item) => {
        this.ldap_kerberos_principal.options.push(
          {label : item, value : item});
      });
    });

    this.ws.call('ldap.ssl_choices').subscribe((res) => {
      this.ldap_ssl = _.find(this.fieldConfig, {name : 'ssl'});
      res.forEach((item) => {
        this.ldap_ssl.options.push(
          {label : item, value : item});
      });
    });

    this.systemGeneralService.getCertificates().subscribe((res) => {
      this.ldapCertificate =
          _.find(this.fieldConfig, {name : 'certificate'});
      res.forEach((item) => {
        this.ldapCertificate.options.push(
          {label : item.name, value : item.id});
      });

      // Handle case when there is no data
      if(res.length == 0){
        this.ldapCertificate.zeroStateMessage = 'No Certificates Found';
      }
    });

    this.ws.call('ldap.schema_choices').subscribe((res) => {
      this.ldap_schema = _.find(this.fieldConfig, {name: 'schema'});
      res.forEach((item => {
        this.ldap_schema.options.push(
          {label : item, value : item});
      }));
    });

    const enabled = entityEdit.formGroup.controls['enable'].value;
    this.entityForm.setDisabled('hostname', !enabled, !enabled);
    this.entityForm.setDisabled('hostname_noreq', enabled, enabled);
    entityEdit.formGroup.controls['enable'].valueChanges.subscribe((res)=> {
      this.entityForm.setDisabled('hostname', !res, !res);
      this.entityForm.setDisabled('hostname_noreq', res, res);
      if(!res){
        this.entityForm.formGroup.controls['hostname_noreq'].setValue(this.entityForm.formGroup.controls['hostname'].value);
      }
      else{
        this.entityForm.formGroup.controls['hostname'].setValue(this.entityForm.formGroup.controls['hostname_noreq'].value);
      }
      
    })
    entityEdit.submitFunction = this.submitFunction;
    setTimeout(() => {
      this.entityForm.formGroup.controls['hostname'].setValue(this.ldap_hostname);
    }, 500)
  }

  beforeSubmit(data){
    if(data["enable"]){
      data["hostname_noreq"] = data["hostname"];
    } else {
      data["hostname"] = data["hostname_noreq"];
    }
    delete(data['hostname_noreq']);
  }

  submitFunction(body: any) {
    return this.ws.call('ldap.update', [body]);
  }

}
