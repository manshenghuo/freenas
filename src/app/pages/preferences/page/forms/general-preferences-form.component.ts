import { ApplicationRef, Component, Injector, OnInit, AfterViewInit, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import {Router} from '@angular/router';
import * as _ from 'lodash';
import { EntityFormEmbeddedComponent } from 'app/pages/common/entity/entity-form/entity-form-embedded.component';
import { FieldConfig } from 'app/pages/common/entity/entity-form/models/field-config.interface';
import { FieldSet } from 'app/pages/common/entity/entity-form/models/fieldset.interface';
import {RestService, WebSocketService} from 'app/services/';
import { ThemeService, Theme, DefaultTheme } from 'app/services/theme/theme.service';
import { CoreService, CoreEvent } from 'app/core/services/core.service';
import { PreferencesService } from 'app/core/services/preferences.service';
import { Subject } from 'rxjs';
import { T } from '../../../../translate-marker';

interface UserPreferences {
  //Preferences Object Structure
  platform:string; // FreeNAS || TrueNAS
  timestamp:Date;
  userTheme:string; // Theme name
  customThemes?: Theme[];
  favoriteThemes?: string[]; // Theme Names
  showTooltips?:boolean; // Form Tooltips on/off // Deprecated
  metaphor:string; // Prefer Cards || Tables || Auto (gui decides based on data array length)
}

@Component({
  selector : 'general-preferences-form',
  template:`<entity-form-embedded *ngIf="preferences" #embeddedForm fxFlex="100" [target]="target" [data]="values" [conf]="this"></entity-form-embedded>`
})
export class GeneralPreferencesFormComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  @ViewChild('embeddedForm', {static: false}) embeddedForm: EntityFormEmbeddedComponent;
  public target: Subject<CoreEvent> = new Subject();
  public isWaiting: boolean = false;
  public values = [];
  public preferences: any;
  public saveSubmitText = T("Update Preferences");
  public multiStateSubmit = true;
  protected isEntity: boolean = true; // was true
  private themeOptions: any[] = [];
  public fieldConfig:FieldConfig[] = [];
  public fieldSetDisplay:string = 'no-margins';//default | carousel | stepper
  public fieldSets: FieldSet[] = [
    {
      name:T('General Preferences'),
      class:'preferences',
      label:true,
      config: []
    }
  ]

    constructor(
      protected router: Router,
      protected rest: RestService,
      protected ws: WebSocketService,
      protected _injector: Injector,
      protected _appRef: ApplicationRef,
      public themeService:ThemeService,
      private core:CoreService
    ) {
    }

    ngOnInit(){
      this.core.emit({name:"UserPreferencesRequest", sender:this});
      this.core.register({observerClass:this,eventName:"UserPreferencesChanged"}).subscribe((evt:CoreEvent) => {
        if(this.isWaiting){
          this.target.next({name:"SubmitComplete", sender: this});
          this.isWaiting = false;
        }

        this.preferences = evt.data;
        this.onPreferences(evt.data);
        this.init(true);
      });

      this.core.register({observerClass:this,eventName:"UserPreferencesReady"}).subscribe((evt:CoreEvent) => {
        if(this.isWaiting){
          this.target.next({name:"SubmitComplete", sender: this});
          this.isWaiting = false;
        }
        this.preferences = evt.data;
        this.onPreferences(evt.data);
        this.init(true);
      });

      this.init();
    }

    ngAfterViewInit(){
    }

    ngOnChanges(changes){
      if(changes.baseTheme){
        alert("baseTheme Changed!")
      }
    }

    ngOnDestroy(){
      this.core.unregister({observerClass:this});
    }

    init(updating?:boolean){
      this.setThemeOptions();
      if(!updating){
        this.startSubscriptions();
      }
      this.generateFieldConfig();
    }

    startSubscriptions(){
      this.core.register({observerClass:this,eventName:"ThemeListsChanged"}).subscribe((evt:CoreEvent) => {
        this.setThemeOptions();
        if(!this.embeddedForm){ return; }

        let theme = this.preferences.userTheme;
        this.embeddedForm.setValue('userTheme', theme);
      });

      this.target.subscribe((evt:CoreEvent) => {
        switch(evt.name){
        case "FormSubmitted":
          let prefs = Object.assign(evt.data, {});
          if(prefs.reset == true){
            this.core.emit({name:"ResetPreferences", sender:this});
            this.target.next({name:"SubmitStart", sender: this});
            this.isWaiting = true;
            return;
          }

          // We don't store this in the backend
          delete prefs.reset;
          
          this.core.emit({name:"ChangePreferences",data: prefs});
          this.target.next({name:"SubmitStart", sender: this});
          this.isWaiting = true;
          break;
        case "CreateTheme":
          this.router.navigate(new Array('').concat(['ui-preferences', 'create-theme']));
          break;
        }
      });

    }

     setThemeOptions(){
       this.themeOptions.splice(0,this.themeOptions.length);
       for(let i = 0; i < this.themeService.allThemes.length; i++){
         let theme = this.themeService.allThemes[i];
         this.themeOptions.push({label:theme.label, value: theme.name});
       }
     }

     onPreferences(prefs){
      this.fieldSets[0].config = [
        {
          type: 'select',
          name: 'userTheme',
          placeholder: T('Choose Theme'),
          options: this.themeOptions,
          value:prefs.userTheme == 'default' ? DefaultTheme.name : prefs.userTheme,
          tooltip:T('Choose a preferred theme.'),
          class:'inline'
        },
        {
          type: 'checkbox',
          name: 'preferIconsOnly',
          placeholder: T('Prefer buttons with icons only'),
          value:prefs.preferIconsOnly,
          tooltip: T('Preserve screen space with icons and tooltips instead of text labels.'),
          class:'inline'
        },
        {
          type: 'checkbox',
          name: 'allowPwToggle',
          placeholder: T('Enable Password Toggle'),
          value:prefs.allowPwToggle,
          tooltip: T('When set, an <i>eye</i> icon appears next to \
 password fields. Clicking the icon reveals the password.'),
          class:'inline'
        },
        {
          type: 'checkbox',
          name: 'tableDisplayedColumns',
          placeholder: T('Reset Table Columns to Default'),
          value: false,
          tooltip: T('Reset all tables to display default columns.'),
          class:'inline'
        },
        {
          type: 'checkbox',
          name: 'retroLogo',
          placeholder: T('Retro Logo'),
          value:prefs.retroLogo,
          tooltip: T('Revert branding back to FreeNAS'),
          class:'inline'
        },
        {
          type: 'checkbox',
          name: 'reset',
          placeholder: T('Reset All Preferences to Default'),
          value: false,
          tooltip: T('Reset all user preferences to their default values. (Custom themes are preserved)'),
          class:'inline'
        },
      ]

      if(this.embeddedForm){
        this.updateValues(prefs);
      }
    }

     generateFieldConfig(){
       for(let i in this.fieldSets){
         for(let ii in this.fieldSets[i].config){
           this.fieldConfig.push(this.fieldSets[i].config[ii]);
         }
       }
     }

     beforeSubmit(data) {
       data.tableDisplayedColumns ? data.tableDisplayedColumns = [] : delete(data.tableDisplayedColumns);
     }

     updateValues(prefs){
      const keys = Object.keys(this.embeddedForm.formGroup.controls);
      keys.forEach((key) => {
        if(key !== 'reset'){
          if(key == 'userTheme' && prefs[key] == 'default'){
            this.embeddedForm.formGroup.controls[key].setValue(DefaultTheme.name);
          } else {
            this.embeddedForm.formGroup.controls[key].setValue(prefs[key]);
          }
        }
      });

      // We don't store this value in middleware so we set it manually
      this.embeddedForm.formGroup.controls['reset'].setValue(false);
     }
}
