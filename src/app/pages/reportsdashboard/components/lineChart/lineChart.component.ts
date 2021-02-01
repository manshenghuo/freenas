import {Component, Input, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, ViewChild, ElementRef} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CoreService, CoreEvent } from 'app/core/services/core.service';
import { ThemeUtils } from 'app/core/classes/theme-utils';
import { ViewComponent } from 'app/core/components/view/view.component';
import { Report, ReportData } from '../report/report.component';
import { ThemeService, Theme } from 'app/services/theme/theme.service';

import {UUID} from 'angular2-uuid';
import * as moment from 'moment-timezone';
import Dygraph from 'dygraphs';
import smoothPlotter from 'dygraphs/src/extras/smooth-plotter.js';
import Chart from 'chart.js';
import * as simplify from 'simplify-js';

interface Conversion {
  value: number;
  prefix?: string;
  suffix?: string;
  shortName?: string;
}

// For Chart.js
interface DataSet {
  label: string;
  data: number[];
  backgroundColor: string[];
  borderColor: string[];
  borderWidth: number;
}

@Component({
  selector: 'linechart', 
     templateUrl:'./lineChart.component.html',
     styleUrls:['./lineChart.component.css']
})
export class LineChartComponent extends ViewComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('wrapper', {static: true}) el: ElementRef;
  @Input() chartId: string;
  @Input() chartColors: string[];
  @Input() data: ReportData;
  @Input() report: Report;
  @Input() title: string;
  @Input() timezone: string;

  @Input() legends?: string[]; 
  @Input() type: string = 'line';
  @Input() convertToCelsius?: true;
  @Input() dataStructure: 'columns'; // rows vs columns
  @Input() minY?: number = 0;
  @Input() maxY?: number = 100;
  @Input() labelY?: string = 'Label Y';
  @Input() interactive: boolean = false;

  public library: string = 'dygraph'; // dygraph or chart.js
  public ctx: any; // canvas context for chart.js

  public chart:any;
  public conf:any;
  public columns:any;
  public linechartData:any;

  public units: string = '';
  public yLabelPrefix: string;
  public showLegendValues: boolean = false;
  public legendEvents: BehaviorSubject<any>;
  public legendLabels: BehaviorSubject<any>;
  public legendAnalytics: BehaviorSubject<any>;

  public _colorPattern: string[] = ["#2196f3", "#009688", "#ffc107", "#9c27b0", "#607d8b", "#00bcd4", "#8bc34a", "#ffeb3b", "#e91e63", "#3f51b5"];
  get colorPattern(){
    return this.chartColors;
  }

  set colorPattern(value){
    this._colorPattern = value;
  }

  public theme: Theme;
  public timeFormat: string = "%H:%M";
  public culling:number = 6;
  public controlUid: string;

  private utils: ThemeUtils;

  constructor(private core:CoreService, public themeService:ThemeService) {
    super();
    this.utils = new ThemeUtils();
    this.controlUid = "chart_" + UUID.UUID();
    this.legendEvents = new BehaviorSubject({xHTML:''});
    this.legendLabels = new BehaviorSubject([]);
    this.legendAnalytics = new BehaviorSubject([]);
  } 

  applyHandledData(columns, linechartData, legendLabels){
    this.columns = columns;
    this.linechartData = linechartData;
    this.legendLabels.next(legendLabels);

  }

  public render(option?:string){
    this.renderGraph(option);
  }

  // dygraph renderer
  public renderGraph(option){
    let data = this.makeTimeAxis(this.data);
    let labels = data.shift();

    const fg2 = this.themeService.currentTheme().fg2;
    const fg2Type = this.utils.getValueType(fg2);
    let fg2RGB = fg2Type == 'hex' ? this.utils.hexToRGB(this.themeService.currentTheme().fg2).rgb : this.utils.rgbToArray(fg2);
    let gridLineColor = 'rgba(' + fg2RGB[0] + ', ' + fg2RGB[1]+ ', ' + fg2RGB[2]+ ', 0.25)'

    let options = {
       drawPoints:false,// Must be disabled for smoothPlotter
       pointSize:1,
       highlightCircleSize:4,
       strokeWidth:1,
       colors: this.colorPattern,
       labels: labels,// time axis
       ylabel: this.yLabelPrefix + this.labelY,
       gridLineColor: gridLineColor,
       showLabelsOnHighlight: false,
       labelsSeparateLines: true,
       axes: {
         y:{
           yRangePad: 24,
           axisLabelFormatter: ( numero, granularity, opts, dygraph  ) => {
             let converted = this.formatLabelValue(numero, this.inferUnits(this.labelY), 1, true);
             let suffix = converted.suffix ? converted.suffix : '';
             return this.limitDecimals(converted.value).toString() + suffix;
           },
         }
       },
       legendFormatter: (data) => {
         let clone = Object.assign({}, data);
         clone.series.forEach((item, index) => {
           if(!item.y){ return; }
           let converted = this.formatLabelValue(item.y, this.inferUnits(this.labelY), 1, true);
           let suffix = converted.shortName !== undefined ? converted.shortName : (converted.suffix !== undefined ?  converted.suffix : '');
           clone.series[index].yHTML = this.limitDecimals(converted.value).toString() + suffix;
        
         });
         
         this.core.emit({name: "LegendEvent-" + this.chartId,data:clone, sender: this})
         return "";
       },
       series: () => {
         let s = {};
         this.data.legend.forEach((item, index) => {
           s[item] = {plotter: smoothPlotter};
         });

         return s;
       },
       drawCallback: (dygraph, is_initial) =>{
         if(dygraph.axes_){
          let numero = dygraph.axes_[0].maxyval;
          let converted = this.formatLabelValue(numero, this.inferUnits(this.labelY));
          if(converted.prefix){
            this.yLabelPrefix = converted.prefix;
          } else {
            this.yLabelPrefix = '';
          }
         } else {
          console.warn("axes not found");
         }
       }
     }

     if(option == 'update'){
       this.chart.updateOptions(options);
     } else {
       this.chart = new Dygraph(this.el.nativeElement, data, options);
     }

  }

  makeColumn(data:ReportData, legendKey): number[]{
    let result = [];

    for(let i = 0; i < data.data.length; i++){
      const value = data.data[i][legendKey];
      result.push(value);
    }

    return result;
  }

  protected makeTimeAxis(rd:ReportData, data?: number[]):any[]{
    if(!data){ data = rd.data; }

      const structure = this.library == 'chart.js' ? 'columns' : 'rows'
        if(structure == 'rows'){
          // Push dates to row based data...
          let rows = [];
          // Add legend with axis to beginning of array
          let legend = Object.assign([],rd.legend);
          legend.unshift('x');
          rows.push(legend);

          for(let i = 0; i < rd.data.length; i++){ 
            let item = Object.assign([], rd.data[i]);
            let dateStr = moment.tz(new Date(rd.start * 1000 + i * rd.step * 1000), this.timezone).format();
            let date = new Date(dateStr.substring(0, dateStr.length-9));
            item.unshift(date);
            rows.push(item);
          }

          return rows;
        } else if(structure == 'columns'){

          let columns = [];

          for(let i = 0; i < rd.data.length; i++){ 
            let date = new Date(rd.start * 1000 + i * rd.step * 1000);
            columns.push(date);
          }

          return columns;
        }

  }

  private processThemeColors(theme):string[]{
    this.theme = theme;
    let colors: string[] = [];
    theme.accentColors.map((color) => {
      colors.push(theme[color]);
    }); 
    return colors;
  }

  private createColorObject(){
    let obj = {};
    this.legends.forEach((item, index)=>{
      obj[item] = this.colorPattern[index]
    })
    return obj;
  }

  public fetchData(rrdOptions, timeformat?: string, culling?:number){
    if(timeformat){
      this.timeFormat = timeformat;
    }
    if(culling){
      this.culling = culling;
    }

    // Convert from milliseconds to seconds for epoch time
    rrdOptions.start = Math.floor(rrdOptions.start / 1000);
    if(rrdOptions.end){
      rrdOptions.end = Math.floor(rrdOptions.end / 1000);
    }

  }

  inferUnits(label:string){
    //if(this.report.units){ return this.report.units; }
    // Figures out from the label what the unit is
    let units = label;
    if(label.includes('%')){
      units = '%';
    } else if(label.includes('°')){
      units = "°";
    } else if(label.toLowerCase().includes("bytes")){
      units = "bytes";
    } else if(label.toLowerCase().includes("bits")){
      units = "bits";
    }

    if(typeof units == 'undefined'){
      console.warn("Could not infer units from " + this.labelY);
    } 
    
    return units;
  }

  formatLabelValue(value: number, units: string, fixed?: number, prefixRules?: boolean): Conversion{
    let output:Conversion = {value: value};
    if(!fixed){ fixed = -1; }
    if(typeof value !== 'number'){ return value; }
    
    switch(units.toLowerCase()){
      case "bits":
      case "bytes":
        output = this.convertKMGT(value, units.toLowerCase(), fixed, prefixRules);
        break;
      case "%":
      case "°":
      default:
        output = this.convertByKilo(value);
    }

    return output;
  }

  convertByKilo(input): Conversion{
    if(typeof input !== 'number'){return input}
    let output = input;
    let prefix: string = ''; 
    let suffix = '';
  
    if(input >= 1000000){    
      output = input / 1000000;
      suffix = 'm';
    } else if(input < 1000000 && input >= 1000 ){
      output = input / 1000;
      suffix = 'k';
    } 
  
    return { value: output, suffix: suffix };  
  }

  limitDecimals(numero: number){
    let subZero = numero.toString().split(".");
    let decimalPlaces = subZero && subZero[1] ? subZero[1].length : 0;
    return decimalPlaces > 2 ? numero.toFixed(2) : numero;
  }

  convertKMGT(value: number, units:string, fixed?: number, prefixRules?: boolean): Conversion{
    const kilo = 1024;
    const mega = kilo * 1024;
    const giga = mega * 1024;
    const tera = giga * 1024;

    let prefix: string = '';
    let output: number = value;
    let shortName: string = '';

    if(value > tera || (prefixRules && this.yLabelPrefix == 'Tera')){
      prefix = "Tera";
      shortName = "TiB";
      output = value / tera;
    } else if((value < tera && value > giga) || (prefixRules && this.yLabelPrefix == 'Giga')){
      prefix = "Giga";
      shortName = "GiB";
      output = value / giga;
    } else if((value < giga && value > mega) || (prefixRules && this.yLabelPrefix == 'Mega')){
      prefix = "Mega";
      shortName = "MiB";
      output = value / mega;
    } else if((value < mega && value > kilo || (prefixRules && this.yLabelPrefix == 'Kilo'))){
      prefix = "Kilo";
      shortName = "KB";
      output = value / kilo;
    }

    if(units == 'bits'){
      shortName = shortName.replace(/i/, '');
      shortName = shortName.toLowerCase();
    }

    return { value: output, prefix: prefix, shortName: shortName };
  }

  ngAfterViewInit() {
    this.render();
  }

  ngOnChanges(changes:SimpleChanges){
    if(changes.data){
      this.render();
    }

    if(changes.data){
      if(this.chart){
        //this.chart.destroy();
        this.render('update');
      } else {
        this.render();// make an update method?
      }
    }
  }

  ngOnDestroy(){
    this.core.unregister({observerClass:this});
    
    this.chart.destroy();
    
  }

}
