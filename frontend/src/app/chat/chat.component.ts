import { Component, OnInit } from '@angular/core';
import { ChatService } from './service/chat.service';
import { ActivatedRoute, Router} from '@angular/router';
import {NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  providers: [ChatService]
})

export class ChatComponent implements OnInit {
    message:String = null;
    chat:any = null;
    chats:any = [];
    friends:any = [];

    constructor(private _chatService: ChatService,  private route: ActivatedRoute, private router: Router, private modalService: NgbModal){
      //displays data received from server to client
      /*
      this._chatService.newUserJoined()
        .subscribe(data=> this.chat.messages.push(data));

      this._chatService.userLeftChat()
      .subscribe(data=>this.chat.messages.push(data));
      */

      this._chatService.newMessageReceived()
      .subscribe(data=>this.chat.messages.push(data));
    }
    


    open(content, name) {
      this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then(
        (result) => {
          if (name == 'addMember') {
            let username = result;
            this._chatService.addMember(this.chat.chatId, username).subscribe(
              res => {
                this.loadChats();
                this.switchChat({id: this.chat.chatId});
              },
              err => console.error(err),
            );
          } else {
            this._chatService.renameChat(this.chat.chatId, this.chat.name).subscribe(
              res => {
                this.loadChats();
              },
              err => console.error(err),
            );
          }
         
      }, (_) => {}
      );
    }
    
    join() {
      this._chatService.joinChat({user:this.chat.user, room:this.chat.chatId});
    }

    leave(){
      this._chatService.leaveChat({user:this.chat.user, room:this.chat.chatId});
    }

    sendMessage() {
        this._chatService.sendMessage({user:this.chat.user, room:this.chat.chatId, message:this.message});
        this.message = "";
    }

    loadChats() {
      this._chatService.loadChats().subscribe(
        res => {
          this.chats = res.result;
        },
        err => console.error(err),
      );
    }

    loadFriends() {
      this._chatService.loadFriends().subscribe(
        res => {
          this.friends = res.result;
        },
        err => console.error(err),
      );
    }

    switchChat(params) {
      if (this.chat) {
        this._chatService.leaveChat(this.chat.chatId);
      }
      let chatId = params.id;
      let friend = params.friend;
      let create = params.create;
      if (chatId || friend) {
        this._chatService.loadMessages(chatId, friend, create).subscribe(
          res => {
            this.chat = res.result;
            this.join();
            if (friend) {
              this.loadChats();
              this.router.navigate(['/chat'], { queryParams: { id: this.chat.chatId } });
            }
          },
          err => console.log(err),
        );
      } else {
        this.chat = null;
      }
    }

    removeChat() {
      if (this.chat) {
        this._chatService.removeChat(this.chat.chatId).subscribe(
          res => {
            this.chat = null;
            this.loadChats();
          },
          err => console.log(err),
        );
      }
    }

    getFriendsNotInChat() {
      let alreadyInChat = this.chat.participants;
      let result = this.friends.filter(f => !alreadyInChat.includes(f.username));
      return result;
    }
    
    canAddMember() {
      return this.getFriendsNotInChat().length > 0;
    }

    participants(chat) {
      return chat.participants.join(', ');
    }

    ngOnInit() {
      this.route.queryParams.subscribe(params => this.switchChat(params));
      this.loadChats();
      this.loadFriends();
    }

}
