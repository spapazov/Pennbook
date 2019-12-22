import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api/api.service';

@Component({
  selector: 'app-interest-feed',
  templateUrl: './interest-feed.component.html',
  styleUrls: ['./interest-feed.component.css', ]
})
export class InterestFeedComponent implements OnInit  {

  name:String;
  users:any = null;

  constructor(private route: ActivatedRoute, private api: ApiService) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.name = params.name;
      this.api.get(`user/interest/${this.name}`).subscribe(
        res => this.users = res.result,
        err => console.error(err),
      );
    });
  }


}
