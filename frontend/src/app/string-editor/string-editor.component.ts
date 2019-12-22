import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { faPencilAlt, faCheck, faCross, faPlus } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-string-editor',
  templateUrl: './string-editor.component.html',
  styleUrls: ['./string-editor.component.css']
})

export class StringEditor {

  iconEdit:any = faPencilAlt;
  iconSave:any = faCheck;
  iconDelete:any = faCross;
  iconAdd:any = faPlus;

  editing:boolean = false;

  @Input() value:String;
  @Input() type:String;
  @Input() deletable:boolean = false;
  @Input() addable:boolean = false;
  @Input() editable:boolean = false;
  @Output() onSave:any = new EventEmitter();
  @Output() onDelete:any = new EventEmitter();

  edit() {
    this.editing = true;
  }

  save() {
    this.editing = false;
    this.onSave.emit(this.value);
    if (this.addable && !this.editable) {
      this.value = null;
    }
  }

  delete() {
    this.editing = false;
    this.onDelete.emit(this.value);
  }
}
