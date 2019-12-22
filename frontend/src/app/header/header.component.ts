import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SignInService } from '../sign-in/service/sign-in.service';
import { SocketService } from '../sockets/socket.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ProfileService} from './../profile/service/profile.service'

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit {

  model : any = {};
  sign : any = {};
  friends: any = null;




  constructor(private router: Router, private signInService: SignInService, private socketService: SocketService, private modalService: NgbModal, private profileService: ProfileService) { }


  ngOnInit() {

  }


  logout() {
    this.router.navigate(['/signin']);
    console.log('logout');

    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.socketService.socket.emit('user-disconnected', {});
  }

  loggedIn() {
    return localStorage.getItem('token') != null;
  }

  username() {
    return localStorage.getItem('username');
  }

  login(form) {
    let user = form.value;
    form.reset();
    this.signInService.login(user).subscribe(res => {
      if (!res.success) {
        alert("Something went wrong: " + JSON.stringify(res.error));
      } else {
        if (res.token) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('username', user.username);
          this.socketService.sendUsername();
          this.router.navigateByUrl('/feed');
        } else {
          alert("Invalid username or password " + JSON.stringify(res.error));
        }
      }
    },
    err => {
      alert("Error: connection failed");
      console.log(err);
    });
  }

  searchUser(user) {
    this.friends = null;
    let value = user.model;
    this.profileService.searchUser({query: value}).subscribe(
      res => {
        this.friends = res.result;
        console.log(this.friends);
      }
    )
  }

  open(content, user) {
    if (user.model == '' || user.model == null) {
      return;
    }
    this.searchUser(user);
    this.modalService.open(content).result.then((result) => {;
    }, (reason) => {
    });
  }



}
