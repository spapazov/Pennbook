import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api/api.service';

@Component({
  selector: 'app-affiliation-feed',
  templateUrl: './affiliation-feed.component.html',
  styleUrls: ['./affiliation-feed.component.css', ]
})
export class AffiliationFeedComponent implements OnInit  {

  name:String;

  constructor(private route: ActivatedRoute, private api: ApiService) { }

  users:any = null;

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.name = params.name;
      this.api.get(`user/affiliated/${this.name}`).subscribe(
        res => this.users = res.result,
        err => console.error(err),
      );
    });
  }


}
