import { Component, OnInit, Input } from '@angular/core';
import { ApiService } from '../api/api.service';
import * as moment from 'moment';
import { faHeart, faThumbsUp, faThumbsDown, faSmileBeam, faSadTear} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})

export class Post implements OnInit {

  @Input() postId:any;
  post:any = {};
  reactions:any = null;
  children:any = null;
  comment:String = null;
  commenting:boolean = false;

  allReactions:any = [
    { icon: faThumbsUp, color: '#02b002', type: 'like' },
    { icon: faThumbsDown, color: '#f02100', type: 'dislike' },
    { icon: faHeart, color: '#ff0095', type: 'heart' },
    { icon: faSmileBeam, color: '#ffa203', type: 'happy' },
  ]


  constructor(private api: ApiService) { }

  ngOnInit() {
    this.post = {
      ready: false,
      postId: this.postId,
    }
    this.loadPost();
    this.loadPostChildren();
    this.loadPostReactions();
  }

  loadPost() {
    this.api.get(`post/${this.post.postId}`).subscribe(
      res => this.post = res.result,
      err => console.log(err),
    )
  }

  loadPostChildren() {
    this.api.get(`post/${this.post.postId}/children`).subscribe(
      res => {
        this.children = res.result;
        setTimeout(() => this.loadPostChildren(), 30 * 1000);
      },
      err => console.log(err),
    )
  }

  loadPostReactions() {
    this.api.get(`post/${this.post.postId}/reactions`).subscribe(
      res => {
        this.reactions = res.result;
        setTimeout(() => this.loadPostChildren(), 30 * 1000);
      },
      err => console.log(err),
    )
  }

  getReaction() {
    for (let reaction of this.reactions) {
      if (reaction.username == this.user()) {
        return reaction;
      }
    }
    return null;
  }

  removeReaction() {
    this.reactions = this.reactions.filter(r => r.username != this.user());
  }

  timeString(datetime) {
    return moment(datetime).fromNow();
  }

  react(type) {
    let reaction = {
      postId: this.post.postId,
      username: this.user(),
      type: type,
    };
    let oldReaction = this.getReaction();
    this.removeReaction();

    // Add
    if (oldReaction ==  null || reaction.type != oldReaction.type) {
      this.api.post('reaction/add', reaction).subscribe(
        res => this.reactions.push(reaction),
        err => console.error(err),
      );
    }
    // Remove
    else {
      this.api.post('reaction/remove', reaction).subscribe(
        res => {},
        err => console.error(err),
      );
    }
  }

  countReactions(type) {
    return this.reactions.filter(r => r.type == type).length;
  }

  user() {
    return localStorage.getItem('username');
  }

  addComment() {
    if (!this.comment) {
      return;
    }
    this.commenting = true;
    this.api.post('post', {
      parent: this.post.postId,
      content: this.comment,
      creator: this.user(),
      wall: this.post.wall.username,
    }).subscribe(
      res => {
        this.comment = null;
        this.children.push(res.result);
        this.commenting = false;
      },
      err => this.commenting = false,
    );
  }
}
