import { Component, AfterViewInit, Input, ViewChild, OnDestroy, ElementRef} from '@angular/core';
import { CoreServiceInjector } from 'app/core/services/coreserviceinjector';
import { CoreService, CoreEvent } from 'app/core/services/core.service';
import { ThemeUtils } from 'app/core/classes/theme-utils';
import { MaterialModule } from 'app/appMaterial.module';
import { NgForm } from '@angular/forms';
import { ChartData } from 'app/core/components/viewchart/viewchart.component';
import { Subject } from 'rxjs';
import { FlexLayoutModule, MediaObserver } from '@angular/flex-layout';
import Chart from 'chart.js';

import { Router } from '@angular/router';
import { UUID } from 'angular2-uuid';
import * as d3 from 'd3';

import filesize from 'filesize';
import { WidgetComponent } from 'app/core/components/widgets/widget/widget.component';

import { ViewChartGaugeComponent } from 'app/core/components/viewchartgauge/viewchartgauge.component';
import { ViewChartBarComponent } from 'app/core/components/viewchartbar/viewchartbar.component';
import { TranslateService } from '@ngx-translate/core';

import { T } from '../../../../translate-marker';
 
interface DataPoint {
  usage?: number | string;
  temperature?: number | string;
  coreNumber: number;
}

// For Chart.js
interface DataSet {
  label: string;
  data: number[];
  backgroundColor: string;
  borderColor?: string;
  borderWidth?: number;
}

@Component({
  selector: 'widget-cpu',
  templateUrl:'./widgetcpu.component.html',
  styleUrls: ['./widgetcpu.component.css']
})
export class WidgetCpuComponent extends WidgetComponent implements AfterViewInit, OnDestroy {

  @ViewChild('load', {static: true}) cpuLoad: ViewChartGaugeComponent;
  @ViewChild('cores',{static: true}) cpuCores: ViewChartBarComponent;
  @Input() data: Subject<CoreEvent>;
  @Input() cpuModel: string;
  public chart: any;// Chart.js instance with per core data
  public ctx: any; // canvas context for chart.js
  private _cpuData: any;
  get cpuData() { return this._cpuData}
  set cpuData(value){
    this._cpuData = value;
    /*if(this.legendData && typeof this.legendIndex !== "undefined"){
      // C3 does not have a way to update tooltip when new data is loaded. 
      // So this is the workaround
      this.legendData[0].value = this.cpuData.data[0][this.legendIndex + 1];
      this.legendData[1].value = this.cpuData.data[1][this.legendIndex + 1];
    }*/
  }

  public cpuAvg: any;
  public title:string = T("CPU");
  public subtitle:string = T("% of all cores");
  public widgetColorCssVar = "var(--accent)";
  public configurable = false;
  public chartId = UUID.UUID();
  public coreCount: number;
  public legendData: any;
  public screenType: string = 'Desktop'; // Desktop || Mobile

  // Mobile Stats
  public tempAvailable: string = 'false';
  public tempMax: number;
  public tempMaxThreads: number[] = [];
  public tempMin: number;
  public tempMinThreads: number[] = [];
  public usageMax: number;
  public usageMaxThreads: number[] = [];
  public usageMin: number;
  public usageMinThreads: number[] = [];

  public legendColors: string[];
  private legendIndex: number;

  public labels: string[] = [];
  protected currentTheme: any;
  private utils: ThemeUtils;


  constructor(public router: Router, public translate: TranslateService, public mediaObserver: MediaObserver, private el: ElementRef){
    super(translate);

    this.utils = new ThemeUtils();

    mediaObserver.media$.subscribe((evt) =>{
      const size = {
        width: evt.mqAlias == 'xs' ? 320 : 536,
        height: 140
      }

      let st = evt.mqAlias == 'xs' ? 'Mobile' : 'Desktop';
      if(this.chart && this.screenType !== st){
        this.chart.resize(size);
      }

      this.screenType = st;
    });
  }

  ngOnDestroy(){
    this.core.unregister({observerClass:this});
  }

  ngAfterViewInit(){

    this.core.register({observerClass: this, eventName:"ThemeChanged"}).subscribe((evt: CoreEvent) => {
      d3.select('#grad1 .begin')
        .style('stop-color', this.getHighlightColor(0))

      d3.select('#grad1 .end')
        .style('stop-color', this.getHighlightColor(0.15))
    });

    this.data.subscribe((evt:CoreEvent) => {
      if(evt.name == "CpuStats"){
        if(evt.data.average){
          this.setCpuLoadData(['Load', parseInt(evt.data.average.usage.toFixed(1))]);
          this.setCpuData(evt.data);
        }
      }
    });

  }

  parseCpuData(data){
    this.tempAvailable = data.temperature && Object.keys(data.temperature).length > 0 ? 'true' : 'false';
    let usageColumn: any[] = ["Usage"];
    let temperatureColumn: any[] = ["Temperature"];


    // Calculate number of cores...
    let keys = Object.keys(data);

    if(!this.coreCount){
      this.coreCount = data.temperature ? keys.length - 2 : keys.length - 1;
    }
    
    for(let i = 0; i < this.coreCount; i++){
      usageColumn.push( parseInt(data[i.toString()].usage.toFixed(1)) );
      if(data.temperature && data.temperature[i]){
        temperatureColumn.push(parseInt(((data.temperature[i] / 10) - 273.05).toFixed(1)));
      }
    }
    
    this.setMobileStats(Object.assign([],usageColumn), Object.assign([],temperatureColumn) ); 

    return [usageColumn, temperatureColumn];
    
  }

  setMobileStats(usage, temps){
    // Usage
    usage.splice(0,1);
    this.usageMin = Math.min(...usage);
    this.usageMax = Math.max(...usage);
    this.usageMinThreads = [];
    this.usageMaxThreads = [];
    for(let u = 0; u < usage.length; u++){
      if(usage[u] == this.usageMin){
        this.usageMinThreads.push(u);
      }

      if(usage[u] == this.usageMax){
        this.usageMaxThreads.push(u);
      }
    }

    // Temperature
    temps.splice(0,1)
    this.tempMin = Math.min(...temps);
    this.tempMax = Math.max(...temps);
    this.tempMinThreads = [];
    this.tempMaxThreads = [];
    for(let t = 0; t < temps.length; t++){
      if(temps[t] == this.tempMin){
        this.tempMinThreads.push(t);
      }

      if(temps[t] == this.tempMax){
        this.tempMaxThreads.push(t);
      }
    }
  }

  setCpuData(data){
    let config: any = {}
    config.title = "Cores";
    config.orientation = 'horizontal';
    config.max = 100;
    config.data = this.parseCpuData(data);
    this.cpuData = config;
    this.coresChartInit();
  }

  setCpuLoadData(data){
    let config: any = {}
    config.title = data[0];
    config.units = "%";
    config.diameter = 136;
    config.fontSize = 28;
    config.max = 100;
    config.data = data;
    config.subtitle = "Avg Usage";
    this.cpuAvg = config;
  }


  setPreferences(form:NgForm){
    let filtered: string[] = [];
    for(let i in form.value){
      if(form.value[i]){
        filtered.push(i);
      }
    }
  }

  // chart.js renderer
  renderChart(){
    if(!this.ctx){
      const el = this.el.nativeElement.querySelector('#cpu-cores-chart canvas');
      if(!el){ return; }

      const ds = this.makeDatasets(this.cpuData.data);
      this.ctx = el.getContext('2d');

      let data = {
        labels: this.labels,
        datasets: ds ,
      }

      let options = {
        events: ['mousemove','mouseout'],
        onHover: (e) => {
          if(e.type == "mouseout"){ 
            this.legendData = null; 
            this.legendIndex = null
          }
        },
        tooltips:{
          enabled: false,
          mode: 'nearest',
          intersect: true,
          callbacks: {
            label: (tt, data) => {
              if(this.screenType.toLowerCase() == 'mobile'){
                this.legendData = null;
                this.legendIndex = null
                return;
              }

              this.legendData = data.datasets;
              this.legendIndex = tt.index;
              
              return '';
            }
          },
          custom: (evt,data) => {
          }
        },
        responsive:true,
        maintainAspectRatio: false,
        legend: {
          display: false
        },
        responsiveAnimationDuration: 0,
        animation: {
          duration: 1000,
          animateRotate: true,
          animateScale: true
        },
        hover: {
          animationDuration: 0 
        },
        scales: {
          xAxes: [{
            maxBarThickness: 16,
            type: 'category',
            labels: this.labels
          }],
          yAxes: [{
            ticks: {
              max:100,
              beginAtZero: true
            }
          }]
        }
      }
      
      this.chart = new Chart(this.ctx, {
        type: 'bar',
        data:data,
        options: options
      });

    } else {

      const ds = this.makeDatasets(this.cpuData.data);
 
      this.chart.data.datasets[0].data = ds[0].data;
      this.chart.data.datasets[1].data = ds[1].data;
      this.chart.update();
    }
  }

  coresChartInit(){

    this.currentTheme = this.themeService.currentTheme();
    this.renderChart();
      
  }

  colorFromTemperature(t){
    let color = "var(--green)";
    if(t.value >= 80){
      color = "var(--red)";
    } else if (t.value < 80 && t.value > 63){
      color = "var(--yellow)";
    } else if(t.value < 64){
      color = "var(--green)";
    }
    return color;
  }

  coresChartUpdate(){
    this.chart.load({
        columns: this.cpuData.data,
    });
  }

  protected makeDatasets(data:any): DataSet[]{
    let datasets = [];
    let labels = [];
    for(let i = 0; i < this.coreCount; i++){
      labels.push((i).toString());
    }
    this.labels = labels;

    // Create the data...
    data.forEach((item, index) => {

      let ds:DataSet = {
        label: item[0],
        data: data[index].slice(1),
        backgroundColor: '',
        borderColor: '', 
        borderWidth: 1,
      }
  
      const accent = this.themeService.isDefaultTheme ? 'orange' : 'accent';
      let color;
      if(accent !== 'accent' && ds.label == 'Temperature'){
        color =  accent;
      } else {
        const cssVar = ds.label == 'Temperature' ? accent : 'primary'; 
        color = this.stripVar(this.currentTheme[cssVar])
      }
      
      const bgRGB = this.utils.convertToRGB(this.currentTheme[color]).rgb;
      const borderRGB = this.utils.convertToRGB(this.currentTheme[color]).rgb;

      ds.backgroundColor = this.rgbToString(bgRGB, 0.85);
      ds.borderColor = this.rgbToString(bgRGB);
      datasets.push(ds);
    });
   
    return datasets
  }
  
  private processThemeColors(theme):string[]{
    let colors: string[] = [];
    theme.accentColors.map((color) => {
      colors.push(theme[color]);
    }); 
    return colors;
  }

  rgbToString(rgb:string[], alpha?:number){
    const a = alpha ? alpha.toString() : '1';
    return 'rgba(' + rgb.join(',') + ',' + a + ')';
  }

  stripVar(str: string){
    return str.replace('var(--', '').replace(')','');
  }

  getHighlightColor(opacity: number){
    // Get highlight color
    let currentTheme = this.themeService.currentTheme();
    let txtColor = currentTheme.fg2;
    const valueType = this.utils.getValueType(txtColor);

    // convert to rgb
    let rgb = valueType == 'hex' ? this.utils.hexToRGB(txtColor).rgb : this.utils.rgbToArray(txtColor);

    // return rgba
    let rgba =  "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + opacity + ")";

    return rgba;
  }

}
