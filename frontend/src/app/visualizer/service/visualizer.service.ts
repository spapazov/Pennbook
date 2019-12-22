import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/api/api.service';

@Injectable({
  providedIn: 'root'
})

export class VisualizerService {
  constructor(private apiService: ApiService) { }

  public getGraph(selected) {
    let url = `graph`;
    if (selected) {
      url += `/${selected}`;
    }
    return this.apiService.get(url);
  }
}
