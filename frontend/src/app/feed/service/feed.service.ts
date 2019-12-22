import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/api/api.service';


@Injectable({
  providedIn: 'root'
})
export class FeedService {

  constructor(private apiService: ApiService) {

  }

  
  public getFeed(wall, type) {
    if (wall) {
      return this.apiService.get(`wall/${type}/${wall}`);
    }
    return this.apiService.get('wall');
  }

  public like(reaction) {
    return this.apiService.post('reaction', reaction);
  }

  public post(post) {
    return this.apiService.post('post', post);
  }

}
