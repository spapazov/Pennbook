import { Component, OnInit } from '@angular/core';
import { SignInService } from './service/sign-in.service';
import { SocketService } from '../sockets/socket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {

  model : any = {};
  sign : any = {};
  error: boolean = false;
  constructor(public signInService: SignInService, public router: Router, private socketService: SocketService) { }

  ngOnInit() {
    if (localStorage.getItem('token')){
      this.router.navigate(['/feed']);
    }
  }

  closeError() {
    this.error = false;
  }

  registerUser(form) {
    let user = form.value;
    let data = {
      username: user.email,
      password: user.password,
      profile: {
        fullName: user.fullName,
        email: user.email,
        birthday: user.birthday
      }
    }

    console.log(data);
    this.signInService.signup(data).subscribe(res => {
      if (!res.success) {
        this.error = true;
        console.log(res);
      } else {
        localStorage.setItem('token', res.token);
        localStorage.setItem('username', data.username);
        this.socketService.sendUsername();
        this.router.navigateByUrl('/feed');
      }
    },
    err => {
      alert("Error: connection failed");
      console.log(err);
    });

  }

}
