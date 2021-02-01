import { Component } from '@angular/core';
import { shared, helptext_sharing_nfs } from 'app/helptext/sharing';
import { T } from 'app/translate-marker';

@Component({
  selector : 'app-nfs-list',
  template : `<entity-table [title]="title" [conf]="this"></entity-table>`
})
export class NFSListComponent {

  public title = "NFS";
  protected queryCall: string = 'sharing.nfs.query';
  protected wsDelete = 'sharing.nfs.delete';
  protected route_add: string[] = [ 'sharing', 'nfs', 'add' ];
  protected route_add_tooltip: string = "Add Unix (NFS) Share";
  protected route_edit: string[] = [ 'sharing', 'nfs', 'edit' ];
  protected route_delete: string[] = [ 'sharing', 'nfs', 'delete' ];

  public columns: any[] = [
    {name: helptext_sharing_nfs.column_path, prop: 'paths', always_display: true },
    {name: helptext_sharing_nfs.column_comment, prop: 'comment'},
    {name: helptext_sharing_nfs.column_enabled, prop: 'enabled'},
  ];
  public rowIdentifier = 'nfs_paths';
  public config: any = {
    paging : true,
    sorting : {columns : this.columns},
    deleteMsg: {
      title: 'Unix (NFS) Share',
      key_props: ['paths']
    },
  };

  public confirmDeleteDialog = {
    message: shared.delete_share_message,
    isMessageComplete: true,
    button: T('Unshare'),
    buildTitle: share => `${T('Unshare')} ${share.paths.join(', ')}`
  }
}
