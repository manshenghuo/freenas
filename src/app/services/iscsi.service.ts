

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject, Subscription} from 'rxjs';

import {EntityUtils} from '../pages/common/entity/utils'
import {RestService} from './rest.service';
import {WebSocketService} from './ws.service';

@Injectable()
export class IscsiService {
  protected volumeResource: string = 'storage/volume';

  constructor(protected rest: RestService, protected ws: WebSocketService) {};

  getIpChoices() {
    return this.ws.call('iscsi.portal.listen_ip_choices');
  };

  listPortals() {
    return this.ws.call('iscsi.portal.query', []);
  };

  listInitiators() {
    return this.ws.call('iscsi.initiator.query', []);
  };

  listTargetGroups() {
    return this.ws.call('iscsi.target.query', []);
  };

  getVolumes() {
    return this.rest.get(this.volumeResource, {});
  };

  getExtentDevices() {
    return this.ws.call('iscsi.extent.disk_choices',[]);
  };

  getExtents() {
    return this.ws.call('iscsi.extent.query', []);
  }

  getTargets() {
    return this.ws.call('iscsi.target.query', []);
  }

  getAuth() {
    return this.ws.call('iscsi.auth.query', []);
  }

  getGlobalSessions() {
    return this.ws.call('iscsi.global.sessions');
  }
}
