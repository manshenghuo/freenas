import { Component,  ViewChild, ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription ,  Observer  } from 'rxjs';
import { HttpClient, HttpRequest, HttpEventType, HttpResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { FieldConfig } from '../../models/field-config.interface';
import { WebSocketService } from '../../../../../../services/';
import { AppLoaderService } from '../../../../../../services/app-loader/app-loader.service';
import { DialogService } from '../../../../../../services/';
import { T } from '../../../../../../translate-marker';

@Component({
  selector: 'app-form-upload',
  templateUrl: './form-upload.component.html',
  styleUrls: ['../dynamic-field/dynamic-field.css', 'form-upload.component.css'],
})
export class FormUploadComponent {
  @ViewChild('fileInput', { static: false}) fileInput: ElementRef<HTMLInputElement>;
  config: FieldConfig;
  group: FormGroup;
  fieldShow: string;
  public busy: Subscription[] = [];
  public sub: Subscription;
  public observer: Observer < any > ;
  public jobId: Number;
  public fileBrowser = true;
  public apiEndPoint = '/_upload?auth_token=' + this.ws.token;
  public fileList: any;
  public fbrowser: any;
  
  constructor(
    protected ws: WebSocketService,protected http: HttpClient, private loader: AppLoaderService,
    public dialog: DialogService, public translate: TranslateService) {}

  public fileBtnClick(){
    this.fileInput.nativeElement.click();
    this.fbrowser = document.getElementById('fb');
    this.fbrowser.onchange = () => {
      this.fileList = this.fileInput.nativeElement.files;
    }
  }

  upload(location = "/tmp/") {
    if(this.config.updater && this.config.parent ){
      this.config.updater(this, this.config.parent);
      return;
    }
  this.loader.open();

  const fileBrowser = this.fileInput.nativeElement;

  if (fileBrowser.files && fileBrowser.files[0]) {
    const formData: FormData = new FormData();
    formData.append('data', JSON.stringify({
      "method": "filesystem.put",
      "params": [location + '/' + fileBrowser.files[0].name, { "mode": "493" }]
    }));
    formData.append('file', fileBrowser.files[0]);
    const req = new HttpRequest('POST', this.apiEndPoint, formData, {
      reportProgress: true
    });
    this.http.request(req).subscribe(event => {
      if (event.type === HttpEventType.UploadProgress) {
        const percentDone = Math.round(100 * event.loaded / event.total);
        const upload_msg = `${percentDone}% Uploaded`
        this.loader.dialogRef.componentInstance.title = upload_msg;

      } else if (event instanceof HttpResponse) {
        if(event.statusText==="OK") {
          this.newMessage(location + '/' + fileBrowser.files[0].name);
          this.loader.close();
          this.dialog.Info(T("File upload complete"), '', '300px', 'info', true);
        }
      };
    },(error)=> {
      this.loader.close();
      this.dialog.errorReport(T("Error"),error.statusText, error.message);

    });

  }
}
newMessage(message){
  if(this.config.message){
    this.config.message.newMessage(message);
  }

}
}
