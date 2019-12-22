import { Injectable } from '@angular/core';
import {SignIn} from './../signin'
import { ApiService } from 'src/app/api/api.service';

const API_URL = "http://localhost:8080/api/";

@Injectable({
  providedIn: 'root'
})

export class SignInService {


  constructor(private apiService: ApiService) { }

  public login(user) {
    return this.apiService.post("login", user);
  }

  public signup(user) {
    return this.apiService.post("signup", user);
  }
}
