import { T } from '../../../translate-marker';
import { Validators } from '@angular/forms';

export default {
smart_fieldset_general: T('General Options'),

smart_interval_placeholder : T('Check Interval'),
smart_interval_tooltip: T('Define a number of minutes for <a\
 href="https://www.freebsd.org/cgi/man.cgi?query=smartd&manpath=FreeBSD+11.1-RELEASE+and+Ports"\
 target="_blank">smartd</a> to wake up and check if any\
 tests are configured to run.'),
smart_interval_validation : [ Validators.required ],

smart_difference_placeholder : T('Difference'),
smart_difference_tooltip: T('Enter a number of degrees in Celsius. SMART reports if\
 the temperature of a drive has changed by N degrees\
 Celsius since the last report.'),
smart_difference_validation : [ Validators.required ],

smart_informational_placeholder : T('Informational'),
smart_informational_tooltip: T('Enter a threshold temperature in Celsius. SMART will\
 message with a log level of LOG_INFO if the\
 temperature is higher than the threshold.'),
smart_informational_validation : [ Validators.required ],

smart_critical_placeholder : T('Critical'),
smart_critical_tooltip: T('Enter a threshold temperature in Celsius. SMART will\
 message with a log level of LOG_CRIT and send an email\
 if the temperature is higher than the threshold.'),
smart_critical_validation : [ Validators.required ],

formTitle: T('S.M.A.R.T.')
}
