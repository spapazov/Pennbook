import { Injectable } from "@angular/core";
import { ApiService } from '../api/api.service';
import * as io from 'socket.io-client';


@Injectable()
export class SocketService {

    public socket:io;

    constructor(private api: ApiService) {
        this.socket = io(api.host(),  {upgrade: true, rememberUpgrade: true});
        this.socket.on('reconnect', () => {
            this.sendUsername();
        });
    }

    sendUsername() {
        let user =  localStorage.getItem('username');
        if (user) {
            this.socket.emit('user', user);
        }
        // setTimeout(() => this.sendUsername(), 5 * 1000);
    }
}
