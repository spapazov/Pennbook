import { Component, OnInit, Input } from '@angular/core';
import { ApiService } from '../api/api.service';
import { faHeart, faThumbsUp, faThumbsDown, faSmileBeam, faSadTear} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-profile-picture',
  templateUrl: './profile-picture.component.html',
  styleUrls: ['./profile-picture.component.css']
})

export class ProfilePicture  {

  @Input() size:any = null;
  @Input() url:String = null;
}
