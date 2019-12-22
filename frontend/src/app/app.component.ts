import { Component, OnInit } from '@angular/core';
import { SocketService } from './sockets/socket.service';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'PennBook';

  constructor(private socketService: SocketService, private router: Router) { }

  ngOnInit() {
    this.socketService.sendUsername();
    this.router.events.subscribe(val => {
      if (val instanceof NavigationEnd) {
        let url = (<NavigationEnd>val).url;
        if (!this.loggedIn() && url != '/signin' ) {
          this.router.navigate(['/signin']);
        } 
      }
  });
  }

  loggedIn() {
    return localStorage.getItem('token') != null;
  }
}
