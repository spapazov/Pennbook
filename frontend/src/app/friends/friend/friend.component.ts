import { Component, Input } from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-friend',
  templateUrl: './friend.component.html',
  styleUrls: ['./friend.component.css']
})
export class FriendComponent {

  @Input() friend:any;
  @Input() showChat:Boolean;

  friends:any = [];

  constructor(private modalService: NgbModal,) { }

  closeModal() {
    this.modalService.dismissAll();
  }
}
