import { Component, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import * as _ from 'lodash';

import { FieldConfig } from '../../models/field-config.interface';
import { Field } from '../../models/field.interface';
import { EntityFormService } from '../../services/entity-form.service';

@Component({
  selector: 'entity-form-list',
  templateUrl: './form-list.component.html',
  styleUrls: ['./form-list.component.css', '../dynamic-field/dynamic-field.css'],
})
export class FormListComponent implements Field, OnInit {
  config: FieldConfig;
  group: FormGroup;
  fieldShow: string;

  public listsFromArray: FormArray;

  constructor(private entityFormService: EntityFormService, private formBuilder: FormBuilder) {}

  ngOnInit() {
    setTimeout(() => {
      this.listsFromArray = this.group.controls[this.config.name] as FormArray;
      if (this.listsFromArray.length === 0) {
        this.add();
      }
    }, 0);
  }

  add() {
    const templateListField = _.cloneDeep(this.config.templateListField);
    this.listsFromArray.push(this.entityFormService.createFormGroup(templateListField));
    this.config.listFields.push(templateListField);
    if (this.config.customEventMethod) {
      this.config.customEventMethod(this);
    }
  }

  delete(id) {
    this.listsFromArray.removeAt(id);
    this.config.listFields.splice(id, 1);
    if (this.config.customEventMethod) {
      this.config.customEventMethod(this);
    }
  }
}
