import { T } from '../../translate-marker';

export default {

jail_placeholder: T('Jail'),

source_placeholder: T('Source'),
source_tooltip: T('Browse to the directory on the system which will \
be accessed by the jail. This directory <b>must</b> \
be separate from the jail pool or dataset.'),

destination_placeholder: T('Destination'),
destination_tooltip: T('Browse to an empty directory within the jail or enter \
a new directory name within the jail directory \
structure. This links to the <b>Source</b> storage \
area.'),

readonly_placeholder: T('Read-Only'),
readonly_tooltip: T('Set to prevent users from modifying the \
<b>Destination</b>.'),

acl_edit_msg: T('ACL cannot be changed when the Source is the top-level dataset for a pool.'),
action_edit_acl: T('Edit ACL'),
}

