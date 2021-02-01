import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Validators } from '@angular/forms';

import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { FieldConfig } from '../../common/entity/entity-form/models/field-config.interface';
import { EntityFormService } from '../../common/entity/entity-form/services/entity-form.service';
import { FieldRelationService } from '../../common/entity/entity-form/services/field-relation.service';
import { AppLoaderService } from '../../../services/app-loader/app-loader.service';
import { WebSocketService, NetworkService } from '../../../services/';
import { EntityUtils } from '../../common/entity/utils';
import { T } from '../../../translate-marker';
import { DialogService, JailService } from '../../../services';
import { regexValidator } from '../../common/entity/entity-form/validators/regex-validation';
import { ipv4Validator, ipv6Validator } from '../../common/entity/entity-form/validators/ip-validation';
import { EntityJobComponent } from '../../common/entity/entity-job';
import { MatDialog } from '@angular/material/dialog';
import helptext from '../../../helptext/plugins/plugins';

@Component({
  selector: 'app-plugin-add',
  templateUrl: './plugin-add.component.html',
  styleUrls: ['../../common/entity/entity-form/entity-form.component.scss', './plugin-add.component.css'],
  providers: [EntityFormService, FieldRelationService, NetworkService, TranslateService, JailService],
})
export class PluginAddComponent implements OnInit {

  protected addCall: string = 'plugin.create';
  public route_goback: string[] = ['plugins'];
  public route_success: string[] = ['plugins'];
  public showSpinner = true;

  public fieldConfig: FieldConfig[] = [{
      type: 'input',
      name: 'plugin_name',
      placeholder: helptext.plugin_name_placeholder,
      disabled: true,
    },
    {
      type: 'input',
      name: 'jail_name',
      placeholder: helptext.jail_name_placeholder,
      tooltip: helptext.uuid_tooltip,
      required: true,
      validation: [ Validators.required, regexValidator(this.jailService.jailNameRegex) ]
    },
    {
      type: 'checkbox',
      name: 'dhcp',
      placeholder: helptext.dhcp_placeholder,
      tooltip: helptext.dhcp_tooltip,
      value: false,
      relation: [{
        action: "DISABLE",
        when: [{
          name: "nat",
          value: true
        }]
      }],
    },
    {
      type: 'checkbox',
      name: 'nat',
      placeholder: helptext.nat_placeholder,
      tooltip: helptext.nat_tooltip,
      value: false,
    },
    {
      type: 'select',
      name: 'ip4_interface',
      placeholder: helptext.ip4_interface_placeholder,
      tooltip: helptext.ip4_interface_tooltip,
      options: [
        {
          label: '---------',
          value: '',
        }
      ],
      value: '',
      relation: [{
        action: "ENABLE",
        connective: 'AND',
        when: [{
          name: "dhcp",
          value: false
        }, {
          name: 'nat',
          value: false,
        }]
      }],
      class: 'inline',
      width: '30%',
    },
    {
      type: 'input',
      name: 'ip4_addr',
      placeholder: helptext.ip4_addr_placeholder,
      tooltip: helptext.ip4_addr_tooltip,
      validation : [ ipv4Validator('ip4_addr') ],
      relation: [{
        action: "ENABLE",
        connective: 'AND',
        when: [{
          name: "dhcp",
          value: false
        }, {
          name: 'nat',
          value: false,
        }]
      }],
      required: true,
      class: 'inline',
      width: '50%',
    },
    {
      type: 'select',
      name: 'ip4_netmask',
      placeholder: helptext.ip4_netmask_placeholder,
      tooltip: helptext.ip4_netmask_tooltip,
      options: this.networkService.getV4Netmasks(),
      value: '',
      relation: [{
        action: "ENABLE",
        connective: 'AND',
        when: [{
          name: "dhcp",
          value: false
        }, {
          name: 'nat',
          value: false,
        }]
      }],
      class: 'inline',
      width: '20%',
    },
    {
      type: 'select',
      name: 'ip6_interface',
      placeholder: helptext.ip6_interface_placeholder,
      tooltip: helptext.ip6_interface_tooltip,
      options: [
        {
          label: '---------',
          value: '',
        }
      ],
      value: '',
      class: 'inline',
      width: '30%',
      relation: [{
        action: "ENABLE",
        connective: 'AND',
        when: [{
          name: "dhcp",
          value: false
        }, {
          name: 'nat',
          value: false,
        }]
      }],
    },
    {
      type: 'input',
      name: 'ip6_addr',
      placeholder: helptext.ip6_addr_placeholder,
      tooltip: helptext.ip6_addr_tooltip,
      validation : [ ipv6Validator('ip6_addr') ],
      relation: [{
        action: "ENABLE",
        connective: 'AND',
        when: [{
          name: "dhcp",
          value: false
        }, {
          name: 'nat',
          value: false,
        }]
      }],
      required: true,
      class: 'inline',
      width: '50%',
    },
    {
      type: 'select',
      name: 'ip6_prefix',
      placeholder: helptext.ip6_prefix_placeholder,
      tooltip: helptext.ip6_prefix_tooltip,
      options: this.networkService.getV6PrefixLength(),
      value: '',
      class: 'inline',
      width: '20%',
      relation: [{
        action: "ENABLE",
        connective: 'AND',
        when: [{
          name: "dhcp",
          value: false
        }, {
          name: 'nat',
          value: false,
        }]
      }],
    }
  ];

   // fields only accepted by ws with value 0/1
   protected TFfields: any = [
    'bpf',
    'template',
    'host_time',
    'dhcp',
    'vnet',
    'rtsold',
    'jail_zfs',
    'hostid_strict_check',
    'boot',
    'exec_clean',
    'mount_linprocfs',
    'mount_procfs',
    'allow_vmm',
    'allow_tun',
    'allow_socket_af',
    'allow_quotas',
    'allow_mount_zfs',
    'allow_mount_tmpfs',
    'allow_mount_procfs',
    'allow_mount_nullfs',
    'allow_mount_fusefs',
    'allow_mount_devfs',
    'allow_mount',
    'allow_mlock',
    'allow_chflags',
    'allow_raw_sockets',
    'allow_sysvipc',
    'allow_set_hostname',
    'mount_fdescfs',
    'mount_devfs',
    'ip6_saddrsel',
    'ip4_saddrsel',
    'ip_hostname',
    'assign_localhost',
    'nat',
  ];
  // fields only accepted by ws with value on/off
  protected OFfields: any = [
    'cpuset',
    'rlimits',
    'memorylocked',
    'vmemoryuse',
    'maxproc',
    'cputime',
    'datasize',
    'stacksize',
    'coredumpsize',
    'openfiles',
    'pseudoterminals',
    'swapuse',
    'nthr',
    'msgqqueued',
    'msgqsize',
    'nmsgq',
    'nsemop',
    'nshm',
    'shmsize',
    'wallclock',
  ];

  protected pluginName: any;
  protected pluginRepository: any;
  public formGroup: any;
  public error: string;

  protected ip4_interfaceField: any;
  protected ip4_netmaskField: any;
  protected ip6_interfaceField: any;
  protected ip6_prefixField: any;

  protected dialogRef: any;
  constructor(protected router: Router,
    protected aroute: ActivatedRoute,
    protected entityFormService: EntityFormService,
    protected fieldRelationService: FieldRelationService,
    protected loader: AppLoaderService,
    protected ws: WebSocketService,
    protected dialog: DialogService,
    protected networkService: NetworkService,
    protected matdialog: MatDialog,
    protected translate: TranslateService,
    protected jailService: JailService) {}

  updateIpValidation() {
    const ip4AddrField = _.find(this.fieldConfig, {'name': 'ip4_addr'});
    const ip6AddrField = _.find(this.fieldConfig, {'name': 'ip6_addr'});
    if (this.formGroup.controls['dhcp'].value == false && this.formGroup.controls['nat'].value == false) {
      if ((this.formGroup.controls['ip4_addr'].value == '' || this.formGroup.controls['ip4_addr'].value == undefined) &&
      (this.formGroup.controls['ip6_addr'].value == '' || this.formGroup.controls['ip6_addr'].value == undefined)) {
        if (ip4AddrField.required == false) {
          ip4AddrField.required = true;
          this.formGroup.controls['ip4_addr'].setValidators([Validators.required, regexValidator(this.networkService.ipv4_regex)]);
          this.formGroup.controls['ip4_addr'].updateValueAndValidity();
        }
        if (ip6AddrField.required == false) {
          ip6AddrField.required = true;
          this.formGroup.controls['ip6_addr'].setValidators([Validators.required, regexValidator(this.networkService.ipv6_regex)]);
          this.formGroup.controls['ip6_addr'].updateValueAndValidity();
        }
      } else {
        if (ip4AddrField.required == true) {
          ip4AddrField.required = false;
          this.formGroup.controls['ip4_addr'].setValidators([regexValidator(this.networkService.ipv4_regex)]);
          this.formGroup.controls['ip4_addr'].updateValueAndValidity();
        }
        if (ip6AddrField.required == true) {
          ip6AddrField.required = false;
          this.formGroup.controls['ip6_addr'].setValidators([regexValidator(this.networkService.ipv6_regex)]);
          this.formGroup.controls['ip6_addr'].updateValueAndValidity();
        }
      }
    }
  }

  ngOnInit() {
    this.ip4_interfaceField = _.find(this.fieldConfig, {'name': 'ip4_interface'});
    this.ip4_netmaskField = _.find(this.fieldConfig, {'name': 'ip4_netmask'});
    this.ip6_interfaceField = _.find(this.fieldConfig, {'name': 'ip6_interface'});
    this.ip6_prefixField = _.find(this.fieldConfig, {'name': 'ip6_prefix'});
    // get interface options
    this.jailService.getInterfaceChoice().subscribe(
      (res)=>{
        for (let i in res) {
          this.ip4_interfaceField.options.push({ label: res[i], value: i});
          this.ip6_interfaceField.options.push({ label: res[i], value: i});
        }
      },
      (res)=>{
        new EntityUtils().handleError(this, res);
      }
    );

    this.formGroup = this.entityFormService.createFormGroup(this.fieldConfig);
    this.formGroup.disable();
    this.formGroup.controls['ip4_addr'].valueChanges.subscribe((res) => {
      this.updateIpValidation()
    });
    this.formGroup.controls['ip6_addr'].valueChanges.subscribe((res) => {
      this.updateIpValidation();
    });
    this.formGroup.controls['dhcp'].valueChanges.subscribe((res) => {
      if(!this.showSpinner) {
        if (res && !this.formGroup.controls['nat'].disabled) {
          this.setDisabled('nat', true);
        }
        if (!res && this.formGroup.controls['nat'].disabled) {
          this.setDisabled('nat', false);
        }
      }
    })

    for (let i in this.fieldConfig) {
      let config = this.fieldConfig[i];
      if (config.relation.length > 0) {
        this.setRelation(config);
      }
    }

    for (let ctrl in this.formGroup.controls) {
      if (!this.formGroup.controls[ctrl].disabled) {
        this.formGroup.controls[ctrl].disable();
      }
    }
    this.aroute.params.subscribe(params => {
      this.pluginName = params['name'];
      this.pluginRepository =  params['plugin_repository'];
      this.formGroup.controls['plugin_name'].setValue(this.pluginName);
      this.ws.call('plugin.defaults', [{
        plugin: this.pluginName,
        plugin_repository: this.pluginRepository,
        refresh: false
      }]).subscribe((defaults) => {
        this.showSpinner = false;
        this.formGroup.enable();
        for (let i in defaults.properties) {
          if (this.formGroup.controls[i]) {
            if (_.indexOf(this.TFfields, i) > -1) {
              defaults.properties[i] = defaults.properties[i] == '1' ? true : false;
            }
            if (_.indexOf(this.OFfields, i) > -1) {
              defaults.properties[i] = defaults.properties[i] == 'on' ? true : false;
            }
            this.formGroup.controls[i].setValue(defaults.properties[i]);
          }
        }
        if (!defaults.properties.hasOwnProperty('dhcp') && !defaults.properties.hasOwnProperty('nat')) {
          this.formGroup.controls['nat'].setValue(true);
        }
      }, (err) => {
        new EntityUtils().handleWSError(this, err, this.dialog);
      });
    });
  }

  goBack() {
    this.router.navigate(new Array('').concat(this.route_goback));
  }

  onSubmit(event: Event) {
    this.error = null;
    let property: any = [];
    let value = _.cloneDeep(this.formGroup.value);

    if (value['ip4_addr'] != undefined) {
      value['ip4_addr'] = value['ip4_interface'] + '|' + value['ip4_addr'] + '/' + value['ip4_netmask'];
      delete value['ip4_interface'];
      delete value['ip4_netmask'];
    }

    if (value['ip6_addr'] != undefined) {
      value['ip6_addr'] = value['ip6_interface'] + '|' + value['ip6_addr'] + '/' + value['ip6_prefix'];
      delete value['ip6_interface'];
      delete value['ip6_prefix'];
    }

    for (let i in value) {
      if (value.hasOwnProperty(i) && i !== 'jail_name') {
        if (value[i] != undefined && value[i] != '') {
          if (value[i] == true) {
            if (i == 'dhcp') {
              property.push('bpf=1');
              property.push('dhcp=1');
              property.push('vnet=1');
            } else if (i == 'nat') {
              property.push('nat=1');
              property.push('vnet=1');
            }
          } else {
            property.push(i + '=' + value[i]);
          }
        }
        delete value[i];
      }
    }
    value['plugin_name'] = this.pluginName;
    value['plugin_repository'] = this.pluginRepository;
    value['props'] = property;

    this.dialogRef = this.matdialog.open(EntityJobComponent, { data: { "title": T("Install") }, disableClose: true });
    this.dialogRef.componentInstance.setDescription(T("Installing plugin..."));
    this.dialogRef.componentInstance.setCall(this.addCall, [value]);
    this.dialogRef.componentInstance.submit();
    this.dialogRef.componentInstance.success.subscribe((res) => {
      this.dialogRef.componentInstance.setTitle(T("Plugin installed successfully"));
      let install_notes = '<p><b>Install Notes:</b></p>';
      for (const msg of res.result.install_notes.split('\n')) {
          install_notes += '<p>' + msg + '</p>';
      }
      this.dialogRef.componentInstance.setDescription(install_notes);
      this.dialogRef.componentInstance.showCloseButton = true;

      this.dialogRef.afterClosed().subscribe(result => {
        this.router.navigate(new Array('/').concat(this.route_success));
      });
    });
  }

  setDisabled(name: string, disable: boolean) {
    if (this.formGroup.controls[name]) {
      const method = disable ? 'disable' : 'enable';
      this.formGroup.controls[name][method]();
      return;
    }

    this.fieldConfig = this.fieldConfig.map((item) => {
      if (item.name === name) {
        item.disabled = disable;
      }
      return item;
    });
  }

  setRelation(config: FieldConfig) {
    let activations =
      this.fieldRelationService.findActivationRelation(config.relation);
    if (activations) {
      let tobeDisabled = this.fieldRelationService.isFormControlToBeDisabled(
        activations, this.formGroup);
      this.setDisabled(config.name, tobeDisabled);

      this.fieldRelationService.getRelatedFormControls(config, this.formGroup)
        .forEach(control => {
          control.valueChanges.subscribe(
            () => { this.relationUpdate(config, activations); });
        });
    }
  }

  relationUpdate(config: FieldConfig, activations: any) {
    let tobeDisabled = this.fieldRelationService.isFormControlToBeDisabled(
      activations, this.formGroup);
    this.setDisabled(config.name, tobeDisabled);
  }

  goAdvanced() {
    this.router.navigate(
      new Array('').concat(["plugins", "advanced", this.pluginName, {'plugin_repository': this.pluginRepository}])
    );
  }
}
