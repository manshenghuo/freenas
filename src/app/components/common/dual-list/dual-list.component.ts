import {Component, ContentChild, EventEmitter, Input, OnInit, Output, TemplateRef} from '@angular/core';
import {difference, ListSelection, ListSelectionImpl} from './models';
import { CdkDragDrop, CdkDragStart } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-dual-listbox',
  styleUrls: ['./dual-list.component.css'],
  templateUrl: 'dual-list.component.html'
})
export class DualListboxComponent implements OnInit {

  @Input() key = 'id';
  @Input() items: any[];
  @Input('selectedItems') _selectedItems: any[];
  @Output() selectedItemsChange = new EventEmitter<Object>();


  @Input() minHeight = '200px';
  @Input() maxHeight = '300px';
  @Input() title1: string;
  @Input() title2: string;

  @ContentChild('templateItem', { static: true}) templateItem: TemplateRef<any>;
  @ContentChild('templateArrowLeft', { static: true}) templateArrowLeft: TemplateRef<any>;
  @ContentChild('templateArrowRight', { static: true}) templateArrowRight: TemplateRef<any>;

  availableItems: ListSelection;
  selectedItems: ListSelection;
  dragging = false;

  ngOnInit() {
    this.availableItems = new ListSelectionImpl(
      difference(this.items, this._selectedItems, this.key)
    );
    this.selectedItems = new ListSelectionImpl(this._selectedItems);
  }

  select() {
    const { from, to } = transfer(this.availableItems, this.selectedItems);
    this.availableItems = from;
    this.selectedItems = to;
    this.selectedItemsChange.emit(this.selectedItems.totalItems);
  }

  return() {
    const { from, to } = transfer(this.selectedItems, this.availableItems);
    this.selectedItems = from;
    this.availableItems = to;
    this.selectedItemsChange.emit(this.selectedItems.totalItems);
  }
  
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      let chosenItems = document.querySelectorAll('.chosen');
      chosenItems.forEach((item) => {
        if (item.classList) {
          item.classList.remove('cdk-drag-placeholder');
        }
      });
      if (document.querySelector('#counter')) {
        document.querySelector('#counter').remove();
      }
    } else {
      event.previousContainer.id === 'cdk-drop-list-0' ? this.select() : this.return();
    }
    this.dragging = false;
  }

  public onDragStart(event: CdkDragStart<string[]>) {
    let div = document.querySelector(`#${event.source.dropContainer.id}`);
    this.dragging = true;
    let b = div.querySelector('.draggable:active')
    let chosenItems = div.querySelectorAll('.chosen');
    if (chosenItems.length > 0) {
      b.insertAdjacentHTML('afterbegin', 
      `<div id="counter" style="background: red; color: white; border-radius: 50%; 
        width:20px; height: 20px; text-align: center; font-weight: 700;
        position: relative; top: 5px; left: 5px;">
        ${chosenItems.length.toString()}</div>`);
    }
    chosenItems.forEach((item) => {
      item.classList.add('cdk-drag-placeholder');
    })
  }
}

const transfer = (from: ListSelection, to: ListSelection) => {
  return {
    from: new ListSelectionImpl(
      from.totalItems.filter(x => !from.isSelected(x))
    ),
    to: new ListSelectionImpl([...from.selectedItems, ...to.totalItems])
  };
};
