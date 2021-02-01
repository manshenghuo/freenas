import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';

import { IscsiService, WebSocketService, AppLoaderService } from '../../../../../services/';
import { EntityUtils } from '../../../../common/entity/utils';
import { helptext_sharing_iscsi } from 'app/helptext/sharing';
import { FieldSet } from '../../../../common/entity/entity-form/models/fieldset.interface';

@Component({
  selector: 'app-iscsi-target-form',
  template: `<entity-form [conf]="this"></entity-form>`,
  providers: [IscsiService],
})
export class TargetFormComponent {

  protected queryCall = 'iscsi.target.query';
  protected addCall = 'iscsi.target.create';
  protected editCall = 'iscsi.target.update';
  public route_success: string[] = ['sharing', 'iscsi', 'target'];
  protected customFilter: Array<any> = [[["id", "="]]];
  protected isEntity = true;

  public fieldSets: FieldSet[] = [
    {
      name: helptext_sharing_iscsi.fieldset_target_basic,
      label: true,
      class: 'basic',
      width: '100%',
      config: [
        {
          type: 'input',
          name: 'name',
          placeholder: helptext_sharing_iscsi.target_form_placeholder_name,
          tooltip: helptext_sharing_iscsi.target_form_tooltip_name,
          required: true,
          validation: helptext_sharing_iscsi.target_form_validators_name,
        },
        {
          type: 'input',
          name: 'alias',
          placeholder: helptext_sharing_iscsi.target_form_placeholder_alias,
          tooltip: helptext_sharing_iscsi.target_form_tooltip_alias,
        },
        {
          type: 'select',
          name: 'mode',
          placeholder: helptext_sharing_iscsi.target_form_placeholder_mode,
          tooltip: helptext_sharing_iscsi.target_form_tooltip_mode,
          options: [
            {
              label: 'iSCSI',
              value: 'ISCSI'
            },
            {
              label: 'Fibre Channel',
              value: 'FC'
            },
            {
              label: 'Both',
              value: 'BOTH'
            }
          ],
          value: 'ISCSI',
          isHidden: true,
        }
      ]
    },
    {
      name: helptext_sharing_iscsi.fieldset_target_group,
      label: true,
      class: 'group',
      width: '100%',
      config: [
        {
          type: 'list',
          name: 'groups',
          width: '100%',
          templateListField: [
            {
              type: 'select',
              name: 'portal',
              placeholder: helptext_sharing_iscsi.target_form_placeholder_portal,
              tooltip: helptext_sharing_iscsi.target_form_tooltip_portal,
              value: '',
              options: [],
              required: true,
              validation: helptext_sharing_iscsi.target_form_validators_portal,
              class: 'inline',
              width: '50%',
            },
            {
              type: 'select',
              name: 'initiator',
              placeholder: helptext_sharing_iscsi.target_form_placeholder_initiator,
              tooltip: helptext_sharing_iscsi.target_form_tooltip_initiator,
              value: null,
              options: [],
              class: 'inline',
              width: '50%',
            },
            {
              type: 'select',
              name: 'authmethod',
              placeholder: helptext_sharing_iscsi.target_form_placeholder_authmethod,
              tooltip: helptext_sharing_iscsi.target_form_tooltip_authmethod,
              value: 'NONE',
              options: [
                {
                  label: 'None',
                  value: 'NONE',
                },
                {
                  label: 'CHAP',
                  value: 'CHAP',
                },
                {
                  label: 'Mutual CHAP',
                  value: 'CHAP_MUTUAL',
                }
              ],
              class: 'inline',
              width: '50%',
            },
            {
              type: 'select',
              name: 'auth',
              placeholder: helptext_sharing_iscsi.target_form_placeholder_auth,
              tooltip: helptext_sharing_iscsi.target_form_tooltip_auth,
              value: null,
              options: [],
              class: 'inline',
              width: '50%',
            },
          ],
          listFields: [],
        }
      ]
    }
  ]
  public fieldConfig;

  private pk: any;
  protected entityForm: any;
  constructor(protected router: Router,
    protected aroute: ActivatedRoute,
    protected iscsiService: IscsiService,
    protected loader: AppLoaderService,
    public translate: TranslateService,
    protected ws: WebSocketService) {
    const basicFieldset = _.find(this.fieldSets, { class: 'basic' });
    this.ws.call('system.info').subscribe(
      (res) => {
        if (res.license && res.license.features.indexOf('FIBRECHANNEL') > -1) {
          _.find(basicFieldset.config, { name: 'mode' }).isHidden = false;
        }
      }
    )
  }

  async prerequisite(): Promise<boolean> {
    const targetGroupFieldset = _.find(this.fieldSets, { class: 'group' });
    const portalGroupField = _.find(targetGroupFieldset.config, { 'name': 'groups' }).templateListField[0];
    const initiatorGroupField = _.find(targetGroupFieldset.config, { 'name': 'groups' }).templateListField[1];
    const authGroupField = _.find(targetGroupFieldset.config, { 'name': 'groups' }).templateListField[3];
    const promise1 = new Promise((resolve, reject) => {
      this.iscsiService.listPortals().toPromise().then(
        (protalRes) => {
          for (let i = 0; i < protalRes.length; i++) {
            let label = protalRes[i].tag;
            if (protalRes[i].comment) {
              label += ' (' + protalRes[i].comment + ')';
            }
            portalGroupField.options.push({ label: label, value: protalRes[i].id })
          }
          resolve(true);
        },
        (protalErr) => {
          resolve(false);
        }
      );
    });
    const promise2 = new Promise((resolve, reject) => {
      this.iscsiService.listInitiators().toPromise().then(
        (initiatorsRes) => {
          initiatorGroupField.options.push({ label: 'None', value: null });
          for (let i = 0; i < initiatorsRes.length; i++) {
            const optionLabel = initiatorsRes[i].id + ' (' + (initiatorsRes[i].initiators.length === 0 ? 'ALL Initiators Allowed' : initiatorsRes[i].initiators.toString()) + ')';
            initiatorGroupField.options.push({ label: optionLabel, value: initiatorsRes[i].id })
          }
          resolve(true);
        },
        (initiatorsErr) => {
          resolve(false);
        }
      );
    });
    const promise3 = new Promise((resolve, reject) => {
      this.iscsiService.getAuth().toPromise().then(
        (authRes) => {
          const tags = _.uniq(authRes.map(item => item.tag));
          authGroupField.options.push({ label: 'None', value: null });
          for (const tag of tags) {
            authGroupField.options.push({ label: tag, value: tag });
          }
          resolve(true);
        },
        (authErr) => {
          resolve(false);
        }
      );
    });

    return await Promise.all([promise1, promise2, promise3]).then(
      (res) => {
        return true;
      }
    );
  }

  preInit() {
    this.aroute.params.subscribe(params => {
      if (params['pk']) {
        this.pk = params['pk'];
        this.customFilter[0][0].push(parseInt(params['pk'], 10));
      }
    });


  }

  afterInit(entityForm: any) {
    this.entityForm = entityForm;
    this.fieldConfig = entityForm.fieldConfig;
  }

  customEditCall(value) {
    this.loader.open();
    this.ws.call(this.editCall, [this.pk, value]).subscribe(
      (res) => {
        this.loader.close();
        this.router.navigate(new Array('/').concat(this.route_success));
      },
      (res) => {
        this.loader.close();
        new EntityUtils().handleWSError(this.entityForm, res);
      }
    );
  }
}
