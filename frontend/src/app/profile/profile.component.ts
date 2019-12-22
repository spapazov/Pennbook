import { Component, OnInit } from '@angular/core';
import { ProfileService } from './service/profile.service'
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api/api.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {

  user: String = null;
  profile:any = {};
  isFriend:boolean = true;
  addingFriend:boolean = false;
  editing:boolean = false;

  constructor(
    private api: ApiService,
    private profileService: ProfileService,
    private route: ActivatedRoute,
  ) { }


  myPage() {
    return this.user == localStorage.getItem('username')
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.user = params.user;
      this.profile = {};
      this.loadProfile();
      this.loadIsFriend();
    });

  }

  addFriend() {
    this.addingFriend = true;
    this.profileService.addFriend({ friend: this.user }).subscribe(
      res => {
        this.isFriend = true;
        this.addingFriend = false;
      },
      err => this.addingFriend = false,
    );
  }

  loadProfile() {
    this.profile = {};
    this.api.get(`profile/${this.user}`).subscribe(
      res => this.profile = res.result,
      err => console.error(err)
    );
  }

  updateAbout(value) {
    this.profile.about = value;
    this.updateProfile({about: value});
  }

  updateEmail(value) {
    this.profile.email = value;
    this.updateProfile({email: value});
  }

  updateBirthday(value) {
    this.profile.birthday = value;
    this.updateProfile({birthday: value});
  }

  updateProfile(data) {
    this.api.post('profile/update', data).subscribe(
      res => {},
      err => console.error(err)
    )
  }

  addAffiliation(name) {
    let data = {name: name};
    this.profile.affiliations.push(data);
    this.profileService.addAffiliation(data).subscribe(
      res => {},
      err => console.error(err)
    )
  }

  addInterest(name) {
    let data = {name: name};
    this.profile.interests.push(data);
    this.profileService.addInterest(data).subscribe(
      res => {},
      err => console.error(err)
    )
  }

  removeInterest(name) {
    let data = {name: name};
    this.profile.interests = this.profile.interests.filter(x => x.name != name);
    this.profileService.removeInterest(data).subscribe(
      res => {},
      err => console.error(err)
    )
  }

  removeAffiliation(name) {
    let data = {name: name};
    console.log(name);
    this.profile.affiliations = this.profile.affiliations.filter(x => x.name != name);
    this.profileService.removeAffiliation(data).subscribe(
      res => {},
      err => console.error(err)
    )
  }

  loadIsFriend() {
    this.api.get(`friend/${this.user}`).subscribe(
      res => this.isFriend = res.result,
      err => console.error(err)
    );
  }

  toString(list) {
    return (list || []).map(a => a.name).join(', ') || "---";
  }
}
