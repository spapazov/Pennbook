import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/api/api.service';


@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private apiService: ApiService) { }

  public getWall(user) {
    return this.apiService.get(`wall/${user}`);
  }

  public getProfile(user) {
    return this.apiService.get(`profile/${user}`);
  }

  public addInterest(interest) {
    return this.apiService.post(`interest/add`, interest);
  }

  public removeInterest(interest) {
    return this.apiService.post(`interest/remove`, interest);
  }

  public addAffiliation(affiliation) {
    return this.apiService.post(`affiliation/add`, affiliation);
  }

  public removeAffiliation(affiliation) {
    return this.apiService.post(`affiliation/remove`, affiliation);
  }

  public updateProfile(profile) {
    return this.apiService.post(`profile/update`, profile);
  }

  public addFriend(friend) {
    return this.apiService.post(`friends/add`, friend);
  }

  public searchUser(query) {
    return this.apiService.post(`user/search`, query);
  }
}
