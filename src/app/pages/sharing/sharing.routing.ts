import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { T } from "app/translate-marker";

import { AFPListComponent } from './afp/afp-list/';
import { AFPFormComponent } from './afp/afp-form/';
import { NFSListComponent } from './nfs/nfs-list/';
import { NFSFormComponent } from './nfs/nfs-form/';
import { WebdavListComponent } from './webdav/webdav-list/';
import { WebdavFormComponent } from './webdav/webdav-form/';
import { SMBListComponent } from './smb/smb-list/';
import { SMBFormComponent } from './smb/smb-form/';
import { SMBAclComponent } from './smb/smb-acl/smb-acl.component';
import { ISCSI } from './iscsi/iscsi.component';
import { IscsiWizardComponent } from './iscsi/iscsi-wizard/iscsi-wizard.component';
import { GlobalconfigurationComponent } from './iscsi/globalconfiguration/';
import { PortalListComponent } from './iscsi/portal/portal-list/';
import { PortalFormComponent } from './iscsi/portal/portal-form/';
import { InitiatorListComponent } from './iscsi/initiator/initiator-list/';
import { InitiatorFormComponent } from './iscsi/initiator/initiator-form/';
import { AuthorizedAccessListComponent } from './iscsi/authorizedaccess/authorizedaccess-list/';
import { AuthorizedAccessFormComponent } from './iscsi/authorizedaccess/authorizedaccess-form/';
import { TargetListComponent} from './iscsi/target/target-list/';
import { TargetFormComponent} from './iscsi/target/target-form/';
import { ExtentListComponent } from './iscsi/extent/extent-list/';
import { ExtentFormComponent } from './iscsi/extent/extent-form/';
import { AssociatedTargetListComponent } from './iscsi/associated-target/associated-target-list/';
import { AssociatedTargetFormComponent } from './iscsi/associated-target/associated-target-form/';
import { EntityDashboardComponent } from '../common/entity/entity-dashboard/entity-dashboard.component';


export const routes: Routes = [
  {
    path: '',
    data: { title: 'Sharing' },
    children: [
    {
      path: '',
      component: EntityDashboardComponent,
    },
    {
      path: 'afp',
      data: { title: 'AFP', breadcrumb: 'AFP', icon: 'share'},
      children: [{
        path: '',
        component: AFPListComponent,
        data: { title: 'AFP', breadcrumb: 'AFP'},
      },{
        path: 'add',
        component: AFPFormComponent,
        data: { title: 'Add', breadcrumb: 'Add' },
      },
      {
        path: 'edit/:pk',
        component: AFPFormComponent,
        data: { title: 'Edit', breadcrumb: 'Edit' },
      }]
    }, {
      path: 'nfs',
      data: { title: 'NFS', breadcrumb: 'NFS', icon: 'share'},
      children: [{
        path: '',
        component: NFSListComponent,
        data: { title: 'NFS', breadcrumb: 'NFS'},
      },{
        path: 'add',
        component: NFSFormComponent,
        data: { title: 'Add', breadcrumb: 'Add' },
      },{
        path: 'edit/:pk',
        component: NFSFormComponent,
        data: { title: 'Edit', breadcrumb: 'Edit' },
      }]
    }, {
      path: 'webdav',
      data: { title: 'WebDAV', breadcrumb: 'WebDAV', icon: 'share'},
      children: [{
        path: '',
        component: WebdavListComponent,
        data: { title: 'WebDAV', breadcrumb: 'WebDAV'},
      },{
        path: 'add',
        component: WebdavFormComponent,
        data: { title: 'Add', breadcrumb: 'Add' },
      },{
        path: 'edit/:pk',
        component: WebdavFormComponent,
        data: { title: 'Edit', breadcrumb: 'Edit' },
      }]
    }, {
      path: 'smb',
      data: { title: 'SMB', breadcrumb: 'SMB', icon: 'share'},
      children: [{
        path: '',
        component: SMBListComponent,
        data: { title: 'SMB', breadcrumb: 'SMB'},
      },{
        path: 'add',
        component: SMBFormComponent,
        data: { title: 'Add', breadcrumb: 'Add' },
      },{
        path: 'edit/:pk',
        component: SMBFormComponent,
        data: { title: 'Edit', breadcrumb: 'Edit' },
      },{
        path: 'acl/:pk',
        component: SMBAclComponent,
        data: { title: T('Share ACL'), breadcrumb: T('Share ACL')},
      }]
    }, {
      path: 'iscsi',
      data: { title: 'iSCSI', breadcrumb: 'iSCSI', icon: 'share'},
      children: [
      {
        path: '',
        data: { title: 'iSCSI', breadcrumb: 'iSCSI'},
        children: [
        {
          path: '',
          redirectTo: 'configuration',
        },
        {
          path: 'wizard',
          data: { title: 'Wizard', breadcrumb: 'Wizard'},
          component: IscsiWizardComponent,
        },
        {
          path: ':pk',
          component: ISCSI,
          data: { title: '', breadcrumb: ''},
        },
        {
          path: 'portals',
          data: { title: 'Portals', breadcrumb: 'Portals'},
          children: [{
            path: 'add',
            component: PortalFormComponent,
            data: { title: 'Add', breadcrumb: 'Add' },
          },{
            path: 'edit/:pk',
            component: PortalFormComponent,
            data: { title: 'Edit', breadcrumb: 'Edit' },
          }]
        }, {
          path: 'initiators',
          data: { title: 'Initiators', breadcrumb: 'Initiators'},
          children: [{
            path: 'add',
            component: InitiatorFormComponent,
            data: { title: 'Add', breadcrumb: 'Add' },
          },{
            path: 'edit/:pk',
            component: InitiatorFormComponent,
            data: { title: 'Edit', breadcrumb: 'Edit' },
          }]
        }, {
          path: 'auth',
          data: { title: 'Authorized Access', breadcrumb: 'Authorized Access'},
          children: [{
            path: 'add',
            component: AuthorizedAccessFormComponent,
            data: { title: 'Add', breadcrumb: 'Add' },
          },{
            path: 'edit/:pk',
            component: AuthorizedAccessFormComponent,
            data: { title: 'Edit', breadcrumb: 'Edit' },
          }]
        },
        {
          path: 'target',
          data: { title: 'Targets', breadcrumb: 'Targets'},
          children: [{
            path: 'add',
            component: TargetFormComponent,
            data: { title: 'Add', breadcrumb: 'Add' },
          },{
            path: 'edit/:pk',
            component: TargetFormComponent,
            data: { title: 'Edit', breadcrumb: 'Edit' },
          }]
        },
        {
          path: 'extent',
          data: { title: 'Extents', breadcrumb: 'Extents'},
          children: [{
            path: 'add',
            component: ExtentFormComponent,
            data: { title: 'Add', breadcrumb: 'Add' },
          },{
            path: 'edit/:pk',
            component: ExtentFormComponent,
            data: { title: 'Edit', breadcrumb: 'Edit' },
          }]
        },
        {
          path: 'associatedtarget',
          data: { title: 'Associated Targets', breadcrumb: 'Associated Targets'},
          children: [{
            path: 'add',
            component: AssociatedTargetFormComponent,
            data: { title: 'Add', breadcrumb: 'Add' },
          },{
            path: 'edit/:pk',
            component: AssociatedTargetFormComponent,
            data: { title: 'Edit', breadcrumb: 'Edit' },
          }]
        }]
      }]
    }]
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(routes);
