import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FeedService } from './service/feed.service'

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit, OnChanges  {

  @Input() wall:String = null;
  @Input() type:String = null;
  postIds:any = null;
  delta:number = 5;
  maxPosts:number = 5;


  constructor(private feedService: FeedService) { }

  ngOnInit() {
    this.getFeed();
    this.setupOnScroll();
  }

  setupOnScroll() {
    let element = document.getElementById('app-container');
    element.onscroll = () => {

      let scroll = element.offsetHeight + element.scrollTop;
      let height = element.scrollHeight;

      if (scroll + 100 > height) {
        this.showMore();
      }
    };
  }

  ngOnChanges() {
    this.maxPosts = 5;
    this.postIds = null;
    this.getFeed();
  }

  insertPost(post) {
    this.postIds.splice(0, 0, post.postId);
  }

  showMore() {
    this.maxPosts += this.delta;
  }

  onScroll(event) {
    console.log(event);
  }

  showCreate() {
    return this.type == null || this.type  == 'user';
  }

  getFeed() {
    this.feedService.getFeed(this.wall, this.type)
      .subscribe(
        res => {
          this.postIds = res.result.map(p => p.postId);
          setTimeout(() => this.getFeed(), 10 * 1000);
        },
        err => console.error(err),
      );
  }

}
