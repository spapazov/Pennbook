import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api/api.service';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit {

  friends:any = null;
  online:any = null;
  recommendations:any = null;

  constructor(private api: ApiService) { }

  loadFriends() {
    this.api.get('friends').subscribe(
      res => this.friends = res.result,
      err => console.error(err),
    );
    setTimeout(() => this.loadFriends(), 10 * 1000);
  }

  loadOnline() {
    this.api.get('user/active').subscribe(
      res => this.online = res.result,
      err => console.error(err),
    );
    setTimeout(() => this.loadOnline(), 5 * 1000);
  }

  loadRecommendations() {
    this.api.get('user/recommendations').subscribe(
      res => this.recommendations = res.result,
      err => console.error(err),
    );
    setTimeout(() => this.loadRecommendations(), 10 * 1000);
  }

  ngOnInit() {
    this.loadFriends();
    this.loadOnline();
    this.loadRecommendations();
  }

}
