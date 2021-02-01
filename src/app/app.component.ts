import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, NavigationCancel, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ThemeService } from 'app/services/theme/theme.service';
import { RoutePartsService } from "./services/route-parts/route-parts.service";
import { MatSnackBar } from '@angular/material/snack-bar';
import * as hopscotch from 'hopscotch';
import { RestService } from './services/rest.service';
import { ApiService } from 'app/core/services/api.service';
import { AnimationService } from 'app/core/services/animation.service';
import { InteractionManagerService } from 'app/core/services/interaction-manager.service';
import { DataService } from 'app/core/services/data.service';
import { CoreService, CoreEvent } from 'app/core/services/core.service';
import { PreferencesService } from 'app/core/services/preferences.service';
import { SystemGeneralService } from './services';
import { WebSocketService } from './services/ws.service';
import { DomSanitizer } from "@angular/platform-browser";
import { MatIconRegistry } from "@angular/material/icon";
import { ChartDataUtilsService } from 'app/core/services/chart-data-utils.service'; // <-- Use this globally so we can run as web worker

import productText from './helptext/product';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  appTitle = 'NAS';
  protected accountUserResource: string = 'account/users/1';
  protected user: any;
  public product_type: string = '';

  constructor(public title: Title,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private routePartsService: RoutePartsService,
    public snackBar: MatSnackBar,
    private ws: WebSocketService,
    private rest: RestService,
    private api: ApiService,
    private animations: AnimationService,
    private ims: InteractionManagerService,
    private core: CoreService,
    public preferencesService: PreferencesService,
    public themeservice: ThemeService,
    public cache: DataService,
    public domSanitizer: DomSanitizer,
    public matIconRegistry: MatIconRegistry,
    public chartDataUtils: ChartDataUtilsService,
    private sysGeneralService: SystemGeneralService) {

    /*
    * MISC CUSTOM ICONS
    * When importing SVG asset files here
    * please prep the SVG file by removing
    * any styling form the <style> tag or inline
    * as it conflicts with our application CSS.
    */
    this.matIconRegistry.addSvgIconSetInNamespace(
      "mdi",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/iconfont/mdi/mdi.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "multipath",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/multipath.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "jail_icon",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/jail_icon.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "ha_disabled",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/ha_disabled.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "ha_enabled",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/ha_enabled.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "ix_full_logo",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/ix_full_logo.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "ix_logomark",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/ix_logomark.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "ha_reconnecting",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/ha_reconnecting.svg")
    );

    // TRUENAS ENTERPRISE
    this.matIconRegistry.addSvgIcon(
      "truenas_logomark_color",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/truenas_enterprise_logomark_rgb.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "truenas_logotype_color",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/truenas_enterprise_logotype_rgb.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "truenas_logomark", // Generic Alias
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/truenas_enterprise_logomark.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "truenas_logotype", // Generic Alias
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/truenas_enterprise_logotype.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "truenas_enterprise_logomark",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/truenas_enterprise_logomark.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "truenas_enterprise_logotype",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/truenas_enterprise_logotype.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "truenas_enterprise_logo_full",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/truenas_enterprise_logo_full.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "truenas_enterprise_text_only",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/truenas_enterprise_logotype.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "truenas_enterprise_logomark_color",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/truenas_enterprise_logomark_rgb.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "truenas_enterprise_logotype_color",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/truenas_enterprise_logotype_rgb.svg")
    );

    // TRUENAS CORE
    this.matIconRegistry.addSvgIcon(
      "truenas_core_logomark_color",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/truenas_core_logomark_rgb.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "truenas_core_logotype_color",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/truenas_core_logotype_rgb.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "truenas_core_logomark",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/truenas_core_logomark.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "truenas_core_logotype",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/truenas_core_logotype.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "truenas_core_logo_full",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/truenas_core_logo_full.svg")
    );
    /*this.matIconRegistry.addSvgIcon(
      "truenas_core_text_only",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/truenas_core_text_only.svg")
    );*/

    // TRUENAS SCALE
    this.matIconRegistry.addSvgIcon(
      "truenas_scale_logomark",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/truenas_scale_logomark.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "truenas_scale_logotype",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/truenas_scale_logotype.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "truenas_scale_logo_full",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/truenas_scale_logo_full.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "truenas_scale_logomark_color",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/truenas_scale_logomark_rgb.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "truenas_scale_logotype_color",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/truenas_scale_logotype_rgb.svg")
    );
    /*this.matIconRegistry.addSvgIcon(
      "truenas_scale_text_only",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/truenas_scale_text_only.svg")
    );*/


    // FREENAS
    this.matIconRegistry.addSvgIcon(
      "freenas_logomark",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/logo.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "freenas_certified",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/logo_certified.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "freenas_logotype",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/logo-text.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "freenas_logo_full",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/logo-full.svg")
    );

    // TRUECOMMAND
    this.matIconRegistry.addSvgIcon(
      "truecommand_logo_blue",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/images/truecommand/truecommand-logo-mark-full-color-rgb.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "truecommand_logo_white",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/images/truecommand/truecommand-logo-mark-white-rgb.svg")
    );

    // encryption icon
    this.matIconRegistry.addSvgIcon(
      "anti-lock",
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/anti-lock.svg")
    )

    // network upload download
    this.matIconRegistry.addSvgIcon(
      'network-upload-download',
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/network-upload-download.svg")
    )

    this.matIconRegistry.addSvgIcon(
      'network-upload-download-disabled',
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/customicons/network-upload-download-disabled.svg")
    )

    const product = productText.product.trim();
    this.title.setTitle(product + ' - ' + window.location.hostname);
    const darkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let path;
    if(window.localStorage.product_type){
      let cachedType = window.localStorage['product_type'].toLowerCase();
      path = "assets/images/truenas_" + cachedType + "_favicon.png";
      if (darkScheme) {
        path = "assets/images/truenas_" + cachedType + "_ondark" + "_favicon.png";
      }
    } else {
      this.sysGeneralService.getProductType.subscribe((res) => {
        path = "assets/images/truenas_" + res.toLowerCase() + "_favicon.png";
        if (darkScheme) {
          path = "assets/images/truenas_" + res.toLowerCase() + "_ondark" + "_favicon.png";
        }
      });
    }
    this.setFavicon(path);

    if (this.detectBrowser("Safari")) {
      document.body.className += " safari-platform";
    }

    router.events.subscribe(s => {
      // save currenturl
      if (s instanceof NavigationEnd) {
        if (this.ws.loggedIn && s.url != '/sessions/signin'){
          sessionStorage.currentUrl = s.url;
        }
      }

      if(this.themeservice.globalPreview){
        // Only for globally applied theme preview
        this.globalPreviewControl();
      }
      if (s instanceof NavigationCancel) {
        let params = new URLSearchParams(s.url.split('#')[1]);
        let isEmbedded = params.get('embedded');

        if(isEmbedded) {
          document.body.className += " embedding-active";
        }
      }
    });

    this.router.errorHandler = function (err:any) {
      const chunkFailedMessage = /Loading chunk [\d]+ failed/;

      if (chunkFailedMessage.test(err.message)) {
        window.location.reload(true);
      }
      console.error(err);
    }
  }

  private setFavicon(str) {
    const link = document.querySelector("link[rel*='icon']") || document.createElement("link")
      link['rel'] = "icon";
      link['type'] = "image/png";
      // link.sizes = "16x16";
      link['href'] = str;
      document.getElementsByTagName('head')[0].appendChild(link);
  }

  private detectBrowser(name){
    let N = navigator.appName;
    let UA = navigator.userAgent;
    let temp;
    let browserVersion = UA.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
    if(browserVersion && (temp = UA.match(/version\/([\.\d]+)/i))!= null)
      browserVersion[2]= temp[1];
    let browserName = browserVersion? browserVersion[1]: N;

    if(name == browserName) return true;
    else return false;
  }

  private globalPreviewControl(){
    let snackBarRef = this.snackBar.open('Custom theme Global Preview engaged','Back to form');
    snackBarRef.onAction().subscribe(()=> {
      this.router.navigate(['ui-preferences','create-theme']);
    });

    if(this.router.url === '/ui-preferences/create-theme' || this.router.url === '/ui-preferences/edit-theme'){
      snackBarRef.dismiss();
    }
  }
}
