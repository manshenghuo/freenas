import { T } from '../../translate-marker';
import { Validators } from '@angular/forms';

export default {
// Kerberos Keytabs form
kkt_heading: T('Kerberos Keytab'),
kkt_ktname_name: 'name',
kkt_ktname_placeholder: T('Name'),
kkt_ktname_tooltip: T('Enter a name for this Keytab.'),
kkt_ktname_validation : [ Validators.required ],

kkt_ktfile_name: 'file',
kkt_ktfile_placeholder: T('Kerberos Keytab'),
kkt_ktfile_tooltip: T('Browse to the keytab file to upload.'),
kkt_ktfile_validation : [ Validators.required ],

// Kerberos Keytabs list
kkt_list_delmsg_title: T('Kerberos Keytab'),
kkt_list_delmsgkey_props: ['name'],

}