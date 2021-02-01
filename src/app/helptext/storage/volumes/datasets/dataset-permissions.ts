import { T } from '../../../../translate-marker';

export default {
dataset_permissions_id_placeholder: T('Path'),

dataset_permissions_acl_placeholder: T('ACL Type'),
dataset_permissions_acl_tooltip: T('Select the type that matches the type of client\
 accessing the dataset.'),

dataset_permissions_user_placeholder: T('User'),
dataset_permissions_user_tooltip: T('Select the user to control the dataset. Users\
 created manually or imported from a directory service\
 appear in the drop-down menu.'),

 apply_user: {
    placeholder: T('Apply User'),
    tooltip: T('Confirm changes to <i>User</i>. To prevent errors, changes to the <i>User</i> \
are submitted only when this box is set.')
},

dataset_permissions_group_placeholder: T('Group'),
dataset_permissions_group_tooltip: T('Select the group to control the dataset. Groups\
 created manually or imported from a directory service\
 appear in the drop-down menu.'),

 apply_group: {
    placeholder: T('Apply Group'),
    tooltip: T('Confirm changes to <i>Group</i>. To prevent errors, changes to the <i>Group</i> \
are submitted only when this box is set.')
},

dataset_permissions_mode_placeholder: T('Access Mode'),
dataset_permissions_mode_tooltip: T('Set the read, write, and execute permissions for the dataset.'),

dataset_permissions_recursive_placeholder: T('Apply Permissions Recursively'),
dataset_permissions_recursive_tooltip: T('Apply permissions recursively to all directories\
 and files within the current dataset.'),

dataset_permissions_traverse_placeholder: T('Traverse'),
dataset_permissions_traverse_tooltip: T('Apply permissions recursively to all child\
 datasets of the current dataset.'),

dataset_permissions_dialog_warning: T('Warning'),
dataset_permissions_dialog_warning_message: T('Changing dataset permission mode can severely\
 affect existing permissions, particularly when going from Windows to Unix permissions.'),

heading_dataset_path: T('Dataset Path'),
heading_owner: T('Owner'),
heading_access: T('Access'),
heading_advanced: T('Advanced'),

acl_manager_button: T('Use ACL Manager')
}
