import { T } from '../../translate-marker';

export default {

plugin_name_placeholder: T('Plugin Name'),

jail_name_placeholder: T('Jail Name'),
uuid_tooltip: T('Required. Can contain letters, numbers, periods (.), \
 dashes (-), and underscores (_).'),

https_placeholder: T('Fetch Method'),
https_tooltip: T('Use encrypted connection for increased security (preferred).'),
http_tooltip: T('Use unencrypted connection.'),

dhcp_placeholder: T('DHCP'),
dhcp_tooltip: T('Set for <a \
href="https://kb.iu.edu/d/adov" \
target="_blank">DHCP</a> to automatically configure \
network settings.'),

nat_placeholder: T('NAT'),
nat_tooltip: T('Network Address Translation (NAT). Transforms local network IP addresses into a single IP address.\
 Set when the jail will share a single connection to the Internet with other systems on the network.'),

ip4_interface_placeholder: T('IPv4 interface'),
ip4_interface_tooltip: T('IPv4 interface for the jail.'),

ip4_addr_placeholder: T('IPv4 Address'),
ip4_addr_tooltip: T('Enter a unique IPv4 address that is in the local \
network and not already in use.'),

ip4_netmask_placeholder: T('IPv4 Netmask'),
ip4_netmask_tooltip: T('IPv4 netmask for the jail.'),

ip6_interface_placeholder: T('IPv6 Interface'),
ip6_interface_tooltip: T('IPv6 interface for the jail.'),

ip6_addr_placeholder: T('IPv6 Address'),
ip6_addr_tooltip: T('Enter a unique IPv6 address that is in the local \
network and not already in use.'),

ip6_prefix_placeholder: T('IPv6 Prefix'),
ip6_prefix_tooltip: T('IPv6 prefix for the jail.'),

multi_update_dialog: {
    title: T('Update Plugins'),
    content: T('Updating selected plugins.'),
    succeed: T('Selected plugins updated.'),
},

portal_dialog: {
    title: T('Go to Admin Portal'),
    admin_portal_placeholder: T('Select the admin portal：'),
    saveButtonText: T('Go to Portal'),
}

}
