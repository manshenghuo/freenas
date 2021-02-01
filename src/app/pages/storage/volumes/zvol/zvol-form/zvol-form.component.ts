import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Validators, ValidationErrors, FormControl } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';

import { RestService, WebSocketService, StorageService } from '../../../../../services/';
import { AppLoaderService } from '../../../../../services/app-loader/app-loader.service';
import { DialogService } from 'app/services/dialog.service';
import { T } from '../../../../../translate-marker';

import { FieldSets } from 'app/pages/common/entity/entity-form/classes/field-sets';
import { EntityFormComponent } from '../../../../common/entity/entity-form';
import { EntityUtils } from '../../../../common/entity/utils';
import helptext from '../../../../../helptext/storage/volumes/zvol-form';
import { forbiddenValues } from 'app/pages/common/entity/entity-form/validators/forbidden-values-validation';
import globalHelptext from '../../../../../helptext/global-helptext';
import { ModalService } from 'app/services/modal.service';

interface ZvolFormData {
  name: string;
  comments: string;
  volsize: number;
  volsize_unit: string;
  force_size: boolean;
  sync: string;
  compression: string;
  deduplication: string;
  sparse: boolean;
  volblocksize: string;
  type: string;
};

@Component({
  selector : 'app-zvol-add',
  template : `<entity-form [conf]="this"></entity-form>`
})
export class ZvolFormComponent {

  protected pk: any;
  protected path: string;
  public sub: Subscription;
  public queryCall = "pool.dataset.query";
  protected compression: any;
  protected advanced_field: Array<any> = [ 'volblocksize' ];
  protected isBasicMode = true;
  protected isNew = true;
  protected isEntity = true;
  public parent: string;
  public data: any;
  public parent_data: any;
  public volid: string;
  public customFilter: any[] = [];
  public pk_dataset: any[] = [];
  public edit_data: any;
  protected entityForm: any;
  public minimum_recommended_zvol_volblocksize: string;
  public namesInUse = [];
  public title: string;

  protected origVolSize;
  protected origHuman;

  public custActions: Array<any> = [
    {
      id: 'basic_mode',
      name: globalHelptext.basic_options,
      function: () => { this.isBasicMode = !this.isBasicMode; }
    },
    {
      id: 'advanced_mode',
      name: globalHelptext.advanced_options,
      function: () => { this.isBasicMode = !this.isBasicMode; }
    }
  ];

  protected byteMap: Object= {
    'T': 1099511627776,
    'G': 1073741824,
    'M': 1048576,
    'K': 1024,
  };
  protected reverseZvolBlockSizeMap: Object= {
    '512': '512',
    '1K' :'1024',
    '2K' : '2048',
    '4K': '4096',
    '8K': '8192',
    '16K':'16384',
    '32K': '32768',
    '64K': '65536',
    '128K': '131072',
    '256K': '262144',
    '512K': '524288',
    '1024K': '1048576',
    '1M':'1048576'
  };
  public fieldSets: FieldSets = new FieldSets([{
    name: '',
    config: [
      {
        type: 'input',
        name: 'name',
        placeholder: helptext.zvol_name_placeholder,
        tooltip: helptext.zvol_name_tooltip,
        validation: [Validators.required, forbiddenValues(this.namesInUse)],
        required: true,
        isHidden: false
      },
      {
        type: 'input',
        name: 'comments',
        placeholder: helptext.zvol_comments_placeholder,
        tooltip: helptext.zvol_comments_tooltip,
      },
      {
        type: 'input',
        name: 'volsize',
        placeholder: helptext.zvol_volsize_placeholder,
        tooltip : helptext.zvol_volsize_tooltip,
        required: true,
        blurEvent:this.blurVolsize,
        blurStatus: true,
        parent: this,
        validation: [
          (control: FormControl): ValidationErrors => {
            const config = this.fieldSets.list()[0].config.find(c => c.name === 'volsize');

            const size = control.value && typeof control.value == "string" ? this.storageService.convertHumanStringToNum(control.value, true) : null;
            const humanSize = control.value;
            
            let errors = control.value && isNaN(size)
              ? { invalid_byte_string: true }
              : null

            if (errors) {
              config.hasErrors = true;
              config.errors = globalHelptext.human_readable.input_error;
            } else if (size === 0) {
              config.hasErrors = true;
              config.errors = helptext.zvol_volsize_zero_error;
              errors = { invalid_byte_string: true };
            } else if ((this.origHuman && humanSize) && 
                      (humanSize !== this.origHuman) &&
                      (size < this.origVolSize)){
              config.hasErrors = true;
              config.errors = helptext.zvol_volsize_shrink_error;
              errors = { invalid_byte_string: true };
            } else {
              config.hasErrors = false;
              config.errors = '';
            }

            return errors;
          }
        ],
      },
      {
        type: 'checkbox',
        name : 'force_size',
        placeholder: helptext.zvol_forcesize_placeholder,
        tooltip : helptext.zvol_forcesize_tooltip,
      },
      {
        type: 'select',
        name: 'sync',
        placeholder: helptext.zvol_sync_placeholder,
        tooltip: helptext.zvol_sync_tooltip,
        options: [
          { label: T('Standard'), value: 'STANDARD' },
          { label: T('Always'), value: 'ALWAYS' },
          { label: T('Disabled'), value: 'DISABLED' }
        ],
      },
      {
        type: 'select',
        name: 'compression',
        placeholder: helptext.zvol_compression_placeholder,
        tooltip: helptext.zvol_compression_tooltip,
        options: [
          {label : T('Off'), value : "OFF"},
          {label : T('lz4 (recommended)'), value : "LZ4"},
          {label : T('zstd (default level, 3)'), value : "ZSTD" },
          {label : T('zstd-5 (slow)'), value : "ZSTD-5" },
          {label : T('zstd-7 (very slow)'), value : "ZSTD-7" },
          {label : T('zstd-fast (default level, 1)'), value : "ZSTD-FAST" },
          {label : T('gzip (default level, 6)'), value : "GZIP"},
          {label : T('gzip-1 (fastest)'), value : "GZIP-1"},
          {label : T('gzip-9 (maximum, slow)'), value : "GZIP-9"},
          {label : T('zle (runs of zeros)'), value : "ZLE"},
          {label : T('lzjb (legacy, not recommended)'), value : "LZJB"},
        ],
        validation: helptext.zvol_compression_validation,
        required: true,
      },
      {
        type: 'select',
        name: 'deduplication',
        placeholder: helptext.zvol_deduplication_placeholder,
        tooltip : helptext.zvol_deduplication_tooltip,
        options: [
          {label : T('On'), value : "ON"},
          {label : T('Verify'), value : "VERIFY"},
          {label : T('Off'), value : "OFF"},
        ],
        validation: helptext.zvol_deduplication_validation,
        required: true,
      },
      {
        type: 'checkbox',
        name : 'sparse',
        placeholder: helptext.zvol_sparse_placeholder,
        tooltip : helptext.zvol_sparse_tooltip,
        isHidden: false
      },
      {
        type: 'select',
        name: 'volblocksize',
        placeholder: helptext.zvol_volblocksize_placeholder,
        tooltip: helptext.zvol_volblocksize_tooltip,
        options: [
          { label: '4 KiB', value: '4K' },
          { label: '8 KiB', value: '8K' },
          { label: '16 KiB', value: '16K' },
          { label: '32 KiB', value: '32K' },
          { label: '64 KiB', value: '64K' },
          { label: '128 KiB', value: '128K' },
        ],
        isHidden: false
      },
    ]
  }]);

  isCustActionVisible(actionId: string) {
    if (actionId === 'advanced_mode' && this.isBasicMode === false) {
      return false;
    } else if (actionId === 'basic_mode' && this.isBasicMode === true) {
      return false;
    }
    return true;
  }

  public sendAsBasicOrAdvanced(data: ZvolFormData): ZvolFormData {
    data.type = "VOLUME"

    if( this.isNew === false ) {
      delete data.name;
      delete data.volblocksize;
      delete data.type;
      delete data.sparse;
    } else {
      data.name = this.parent + "/" + data.name;
    }

    if( this.isBasicMode === true ) {

    }
    if (this.origHuman !== data.volsize) {
      data.volsize = this.storageService.convertHumanStringToNum(data.volsize, true);
    } else {
      delete data.volsize;
    }
    return data;
  }


  constructor(
    protected router: Router, protected aroute: ActivatedRoute,
    protected rest: RestService, protected ws: WebSocketService,
    protected loader: AppLoaderService, protected dialogService: DialogService,
    protected storageService: StorageService, private translate: TranslateService,
    protected modalService: ModalService
  ) {}


  async preInit(entityForm: EntityFormComponent){
    if (!this.parent) return;

    const name = this.fieldSets.config('name');
    const sparse = this.fieldSets.config('sparse');
    const sync = this.fieldSets.config('sync');
    const compression = this.fieldSets.config('compression');
    const deduplication = this.fieldSets.config('deduplication');
    const volblocksize = this.fieldSets.config('volblocksize');

    this.isNew = true;

    await this.ws.call('pool.dataset.query', [[["id", "=", this.parent]]]).toPromise().then((pk_dataset) => {
      let children = (pk_dataset[0].children);
      entityForm.setDisabled('name',false);
      if (children.length > 0) {
        for (let i in children) {
          this.namesInUse.push(/[^/]*$/.exec(children[i].name)[0]);
        };
      }
      this.translate.get('Inherit').subscribe(inheritTr => {

      if(pk_dataset && pk_dataset[0].type ==="FILESYSTEM"){
        const sync_inherit = [{label:`${inheritTr} (${pk_dataset[0].sync.rawvalue})`, value: 'INHERIT'}];
        const compression_inherit = [{label:`${inheritTr} (${pk_dataset[0].compression.rawvalue})`, value: 'INHERIT'}];
        const deduplication_inherit = [{label:`${inheritTr} (${pk_dataset[0].deduplication.rawvalue})`, value: 'INHERIT'}];
        const volblocksize_inherit = [{label:`${inheritTr}`, value: 'INHERIT'}];

        sync.options = sync_inherit.concat(sync.options);
        compression.options = compression_inherit.concat(compression.options);        
        deduplication.options = deduplication_inherit.concat(deduplication.options);
        volblocksize.options = volblocksize_inherit.concat(volblocksize.options);

        entityForm.formGroup.controls['sync'].setValue('INHERIT');
        entityForm.formGroup.controls['compression'].setValue('INHERIT');
        entityForm.formGroup.controls['deduplication'].setValue('INHERIT');

        this.title = helptext.zvol_title_add;

        const root = this.parent.split("/")[0];
        this.ws.call('pool.dataset.recommended_zvol_blocksize',[root]).subscribe(res=>{
          this.entityForm.formGroup.controls['volblocksize'].setValue(res);
          this.minimum_recommended_zvol_volblocksize = res;
        })
      } else {
        let parent_dataset = pk_dataset[0].name.split('/')
        parent_dataset.pop()
        parent_dataset = parent_dataset.join('/')

        this.ws.call('pool.dataset.query', [[["id","=",parent_dataset]]]).subscribe((parent_dataset_res)=>{
          this.custActions = null;
          entityForm.setDisabled('name',true);
          sparse['isHidden'] =true;
          volblocksize['isHidden'] =true;
          this.fieldSets.config('sparse')['isHidden']=true;
          this.customFilter = [[["id", "=", this.parent]]]
          
          let sync_collection = [{label:pk_dataset[0].sync.value, value: pk_dataset[0].sync.value}];
          let compression_collection = [{label:pk_dataset[0].compression.value, value: pk_dataset[0].compression.value}];
          let deduplication_collection = [{label:pk_dataset[0].deduplication.value, value: pk_dataset[0].deduplication.value}];

          const volumesize = pk_dataset[0].volsize.parsed;

          this.isNew =false;
          this.title = helptext.zvol_title_edit;

          // keep track of original volume size data so we can check to see if the user intended to change since
          // decimal has to be truncated to three decimal places
          this.origVolSize = volumesize;

          const humansize = this.storageService.convertBytestoHumanReadable(volumesize);
          this.origHuman = humansize;

          entityForm.formGroup.controls['name'].setValue(pk_dataset[0].name);
          if(pk_dataset[0].comments){
            entityForm.formGroup.controls['comments'].setValue(pk_dataset[0].comments.value);
          }
          else {
            entityForm.formGroup.controls['comments'].setValue('');
          }

          entityForm.formGroup.controls['volsize'].setValue(humansize);

          if (pk_dataset[0].sync.source === "INHERITED" || pk_dataset[0].sync.source === "DEFAULT" ){
            sync_collection = [{label:`${inheritTr} (${parent_dataset_res[0].sync.rawvalue})`, value: parent_dataset_res[0].sync.value}];


          } else {
            sync_collection = [{label:`${inheritTr} (${parent_dataset_res[0].sync.rawvalue})`, value: 'INHERIT'}];
            entityForm.formGroup.controls['sync'].setValue(pk_dataset[0].sync.value);
          }

          sync.options = sync_collection.concat(sync.options);

          if (pk_dataset[0].compression.source === "INHERITED" || pk_dataset[0].compression.source === "DEFAULT" ){
            compression_collection = [{label:`${inheritTr} (${parent_dataset_res[0].compression.rawvalue})`, value: parent_dataset_res[0].compression.value}];

          } else {
            compression_collection = [{label:`${inheritTr} (${parent_dataset_res[0].compression.rawvalue})`, value: 'INHERIT'}];
            entityForm.formGroup.controls['compression'].setValue(pk_dataset[0].compression.value);
          }

          compression.options = compression_collection.concat(compression.options);


          if (pk_dataset[0].deduplication.source === "INHERITED" || pk_dataset[0].deduplication.source === "DEFAULT" ){
            deduplication_collection = [{label:`${inheritTr} (${parent_dataset_res[0].deduplication.rawvalue})`, value: parent_dataset_res[0].deduplication.value}];

          } else {
            deduplication_collection = [{label:`${inheritTr} (${parent_dataset_res[0].deduplication.rawvalue})`, value: 'INHERIT'}];
            entityForm.formGroup.controls['deduplication'].setValue(pk_dataset[0].deduplication.value);
          }

          deduplication.options = deduplication_collection.concat(deduplication.options);


          entityForm.formGroup.controls['sync'].setValue(pk_dataset[0].sync.value);
          if (pk_dataset[0].compression.value === 'GZIP') {
            entityForm.formGroup.controls['compression'].setValue(pk_dataset[0].compression.value+'-6');
          }
          else{
            entityForm.formGroup.controls['compression'].setValue(pk_dataset[0].compression.value);

          }
          entityForm.formGroup.controls['deduplication'].setValue(pk_dataset[0].deduplication.value);
        })
      }
    })
    })
  }

  afterInit(entityForm: EntityFormComponent) {
    this.entityForm = entityForm;
    this.entityForm.formGroup.controls['volblocksize'].valueChanges.subscribe((res)=>{
      const res_number = parseInt(this.reverseZvolBlockSizeMap[res],10);
      if(this.minimum_recommended_zvol_volblocksize){
        const recommended_size_number = parseInt(this.reverseZvolBlockSizeMap[this.minimum_recommended_zvol_volblocksize],0);
        if (res_number < recommended_size_number){
          this.translate.get(helptext.blocksize_warning.a).subscribe(blockMsgA => (
            this.translate.get(helptext.blocksize_warning.b).subscribe(blockMsgB => {
              this.fieldSets.config('volblocksize').warnings = 
              `${blockMsgA} ${this.minimum_recommended_zvol_volblocksize}. ${blockMsgB}`
            })
          ))

        } else {
          this.fieldSets.config('volblocksize').warnings = null;
        };
      };
    });
  }

  blurVolsize(parent){
    if (parent.entityForm) {
        parent.entityForm.formGroup.controls['volsize'].setValue(parent.storageService.humanReadable);
    }
  }

  addSubmit(body: any) {
    const data: any = this.sendAsBasicOrAdvanced(body);

    if (data.sync === 'INHERIT') {
      delete(data.sync);
    }
    if (data.compression === 'INHERIT') {
      delete(data.compression);
    }
    if (data.deduplication === 'INHERIT') {
      delete(data.deduplication);
    }
    if (data.volblocksize !== 'INHERIT') {
      let volblocksize_integer_value = data.volblocksize.match(/[a-zA-Z]+|[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)+/g)[0];
      volblocksize_integer_value = parseInt(volblocksize_integer_value,10)

      if (volblocksize_integer_value === 512){
        volblocksize_integer_value = 512
      } else {
        volblocksize_integer_value = volblocksize_integer_value * 1024
      }

      data.volsize = data.volsize + (volblocksize_integer_value - data.volsize%volblocksize_integer_value)

    } else{
      delete(data.volblocksize);
    }

    return this.ws.call('pool.dataset.create', [ data ]);
  }
  editSubmit(body: any) {
     this.ws.call('pool.dataset.query', [[["id", "=", this.parent]]]).subscribe((res)=>{
      this.edit_data = this.sendAsBasicOrAdvanced(body);
      let volblocksize_integer_value = res[0].volblocksize.value.match(/[a-zA-Z]+|[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)+/g)[0];
      volblocksize_integer_value = parseInt(volblocksize_integer_value,10)
      if (volblocksize_integer_value === 512){
        volblocksize_integer_value = 512
      } else {
        volblocksize_integer_value = volblocksize_integer_value * 1024
      }
      if(this.edit_data.volsize && this.edit_data.volsize%volblocksize_integer_value !== 0){
        this.edit_data.volsize = this.edit_data.volsize + (volblocksize_integer_value - this.edit_data.volsize%volblocksize_integer_value)
      }
      let rounded_vol_size  = res[0].volsize.parsed

      if(res[0].volsize.parsed%volblocksize_integer_value !== 0){
        rounded_vol_size  = res[0].volsize.parsed + (volblocksize_integer_value - res[0].volsize.parsed%volblocksize_integer_value)
      }

      if(!this.edit_data.volsize || this.edit_data.volsize >= rounded_vol_size){
        this.ws.call('pool.dataset.update', [this.parent, this.edit_data]).subscribe((restPostResp) => {
          this.loader.close();
          this.modalService.close('slide-in-form');
        }, (eres) => {
          this.loader.close();
          new EntityUtils().handleWSError(this.entityForm, eres);
        });
      } else{
        this.loader.close();
        this.dialogService.Info(helptext.zvol_save_errDialog.title, helptext.zvol_save_errDialog.msg)
        this.modalService.close('slide-in-form');
      }
    })
  }

  customSubmit(body: any) {
    this.loader.open();

    if(this.isNew === true){
      this.addSubmit(body).subscribe((restPostResp) => {
        this.loader.close();
        this.modalService.close('slide-in-form');
        this.modalService.refreshTable();
      }, (res) => {
        this.loader.close();
        new EntityUtils().handleWSError(this.entityForm, res);
      });
    } else{
      this.editSubmit(body);
    }
  }

  setParent(id) {
    this.parent = id;
  }
}
