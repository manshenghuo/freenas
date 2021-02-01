import { NgModule } from '@angular/core';
import { MaterialModule } from '../../appMaterial.module';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';

import { PageComponent } from 'app/core/components/page/page.component';
import { ViewComponent } from 'app/core/components/view/view.component';
import { CardComponent } from 'app/core/components/card/card.component';
import { ViewControlComponent } from 'app/core/components/viewcontrol/viewcontrol.component';
import { ViewControllerComponent } from 'app/core/components/viewcontroller/viewcontroller.component';
import { Display } from 'app/core/components/display/display.component';
import { ViewButtonComponent } from './viewbutton/viewbutton.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule }   from '@angular/forms';
import { CommonDirectivesModule } from '../../directives/common/common-directives.module';

import { ViewChartComponent } from 'app/core/components/viewchart/viewchart.component';
import { ViewChartPieComponent } from 'app/core/components/viewchartpie/viewchartpie.component';
import { ViewChartDonutComponent } from 'app/core/components/viewchartdonut/viewchartdonut.component';
import { ViewChartGaugeComponent } from './viewchartgauge/viewchartgauge.component';
import { ViewChartBarComponent } from './viewchartbar/viewchartbar.component';
import { ViewChartLineComponent } from './viewchartline/viewchartline.component';
import { StorageService } from '../../services/storage.service';

import { WidgetComponent } from 'app/core/components/widgets/widget/widget.component';
import { WidgetChartComponent } from 'app/core/components/widgets/widgetchart/widgetchart.component';
import { WidgetSysInfoComponent } from 'app/core/components/widgets/widgetsysinfo/widgetsysinfo.component';
import { WidgetNicComponent } from 'app/core/components/widgets/widgetnic/widgetnic.component';
import { WidgetCpuComponent } from 'app/core/components/widgets/widgetcpu/widgetcpu.component';

import { WidgetMemoryComponent } from 'app/core/components/widgets/widgetmemory/widgetmemory.component';
import { WidgetPoolComponent } from 'app/core/components/widgets/widgetpool/widgetpool.component';
import { SimpleFailoverBtnComponent, SimpleFailoverBtnDialog } from 'app/core/components/widgets/widgetsysinfo/simple-failover-btn.component';


import { TranslateModule } from '@ngx-translate/core';
import { ContextMenuComponent } from './context-menu/context-menu.component';
import { CopyPasteMessageComponent } from 'app/pages/shell/copy-paste-message.component';
import { TextLimiterDirective } from './directives/text-limiter/text-limiter.directive';
import { TextLimiterTooltipComponent } from './directives/text-limiter/text-limiter-tooltip/text-limiter-tooltip.component';
import { WidgetControllerComponent } from './widgets/widgetcontroller/widgetcontroller.component';
import { ConvertPipe } from './pipes/convert.pipe';
import { CopyButtonComponent } from 'app/core/components/copy-btn/copy-btn.component';

/*
 *
 * This is the Core Module. By importing this module you'll 
 * ensure your page will have the right dependencies in place
 * to make use of Core Components
 *
 * */

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    OverlayModule,
    PortalModule,
    FlexLayoutModule,
    FormsModule,
    TranslateModule,
    CommonDirectivesModule
  ],
  declarations: [
    ContextMenuComponent,
    CopyPasteMessageComponent,
    PageComponent,
    ViewComponent,
    CardComponent,
    ViewControlComponent,
    ViewControllerComponent,
    Display,
    ViewButtonComponent,
    ViewChartComponent,
    ViewChartDonutComponent,
    ViewChartPieComponent,
    ViewChartGaugeComponent,
    ViewChartBarComponent,
    ViewChartLineComponent,
    WidgetComponent,
    WidgetChartComponent,
    WidgetSysInfoComponent,
    WidgetNicComponent,
    WidgetCpuComponent,
    WidgetMemoryComponent,
    WidgetPoolComponent,
    TextLimiterDirective,
    TextLimiterTooltipComponent,
    WidgetControllerComponent,
    SimpleFailoverBtnComponent,
    SimpleFailoverBtnDialog,
    ConvertPipe,
    CopyButtonComponent,
  ],
  exports: [ // Modules and Components here
    CommonModule,
    MaterialModule,
    OverlayModule,
    PortalModule,
    FlexLayoutModule,
    Display,
    ContextMenuComponent,
    CopyPasteMessageComponent,
    PageComponent,
    ViewComponent, 
    ViewChartComponent,
    ViewChartDonutComponent,
    ViewChartGaugeComponent,
    ViewChartBarComponent,
    ViewChartPieComponent,
    ViewChartLineComponent,
    ViewControlComponent,
    ViewButtonComponent,
    ViewControllerComponent,
    CardComponent,
    WidgetComponent,
    WidgetChartComponent,
    WidgetSysInfoComponent,
    WidgetNicComponent,
    WidgetCpuComponent,
    WidgetMemoryComponent,
    TextLimiterDirective,
    TextLimiterTooltipComponent,
    WidgetPoolComponent,
    WidgetControllerComponent,
    SimpleFailoverBtnComponent,
    SimpleFailoverBtnDialog,
    CopyButtonComponent,
  ],
  entryComponents:[
    ContextMenuComponent,
    CopyPasteMessageComponent,
    ViewComponent,
    ViewChartComponent,
    ViewChartDonutComponent,
    ViewChartGaugeComponent,
    ViewChartBarComponent,
    ViewChartPieComponent,
    ViewChartLineComponent,
    ViewControlComponent,
    ViewButtonComponent,
    ViewControllerComponent,
    CardComponent,
    WidgetComponent,
    WidgetChartComponent,
    WidgetSysInfoComponent,
    WidgetNicComponent,
    WidgetCpuComponent,
    WidgetMemoryComponent,
    WidgetPoolComponent,
    TextLimiterTooltipComponent,
    WidgetControllerComponent,
    SimpleFailoverBtnComponent,
    SimpleFailoverBtnDialog,
    CopyButtonComponent,
  ],
  providers:[
    StorageService
  ]
})
export class CoreComponents {}
