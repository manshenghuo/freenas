import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgxUploaderModule} from 'ngx-uploader';
import { MaterialModule } from '../../appMaterial.module';
import { CommonDirectivesModule } from '../../directives/common/common-directives.module';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import {EntityModule} from '../common/entity/entity.module';

import {routing} from './plugins.routing';
import { PluginAddComponent } from './plugin-add/plugin-add.component';
import { PluginsComponent } from './plugins.component';
import { AvailablePluginsComponent } from './available-plugins/available-plugins.component';

@NgModule({
  imports : [
    EntityModule, CommonModule, FormsModule,
    ReactiveFormsModule, NgxUploaderModule, routing, MaterialModule, TranslateModule,
    FlexLayoutModule, CommonDirectivesModule
  ],
  declarations : [
  	PluginAddComponent,
    PluginsComponent,
    AvailablePluginsComponent,
  ],
  entryComponents: [AvailablePluginsComponent]
})
export class PluginsModule {
}
