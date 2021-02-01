import {Validators} from '@angular/forms';
import { T } from '../../../translate-marker';

export default {
import_title: T('Import Pool'),
edit_title: T('Edit Pool'),

is_new_main_label: T('Create or Import pool'),
is_new_placeholder: T('Create a pool:'),
is_new_option1_label: T('Create new pool'),
is_new_option1_tooltip: T('Create a new, empty pool.'),
is_new_option2_label: T('Import an existing pool'),
is_new_option2_tooltip: T('Import a pool that exists but is not connected.'),

enctrypted_main_label: T('Decrypt pool'),
enctypted_placeholder: T('Does the pool have GELI Encryption from FreeNAS/TrueNAS 11.3 or earlier?'),
encrypted_option1_label: T('No, continue with import'),
encrypted_option1_tooltip: T('Unencrypted pools can be imported directly.'),
encrypted_option2_label: T('Yes, decrypt the disks'),
encrypted_option2_tooltip: T('Encrypted pool disks must be decrypted prior to import.'),

devices_placeholder: T('Disks'),
devices_validation : [ Validators.required ],
devices_tooltip: T('Select the disks to decrypt.'),

key_placeholder: T('Encryption Key'),
key_tooltip: T('Click <b>Browse</b> to select an encryption key to\
 upload. This allows the system to decrypt the disks.'),

passphrase_placeholder: T('Passphrase'),
passphrase_tooltip: T('Enter the decryption passphrase.'),

import_label: T('Select pool to import'),
guid_placeholder: T('Pool'),
guid_tooltip: T('Select a pool to import.'),

find_pools_title: T("Finding Pools"),
find_pools_msg: T("Finding pools to import..."),

decrypt_disks_title: T("Decrypting Disks"),

unlock_dataset_dialog_title: T('Encrypted Datasets'),
unlock_dataset_dialog_message: T('The imported pool contains encrypted datasets, unlock them now?'),
unlock_dataset_dialog_button: T('Continue')
}
