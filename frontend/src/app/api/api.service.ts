import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';

const LOCAL = false;

const HOST = LOCAL ? 'localhost:8080' : 'pennbook.sparber.io';
const PROTOCOL = LOCAL ? 'http' : 'https'

@Injectable()
export class ApiService {

    constructor(private httpClient: HttpClient) { }

    host() {
        return HOST;
    }

    apiUrl() {
        return `${PROTOCOL}://${this.host()}/api/`;
    }

    token() {
        return `Bearer ${localStorage.getItem('token')}`;
    }

    post(path, data) {
        return this.httpClient.post<any>(`${this.apiUrl()}${path}`, data, {headers: {
            Authorization: this.token(),
        }});
    }

    get(path) {
        return this.httpClient.get<any>(`${this.apiUrl()}${path}`, {headers: {
            Authorization: this.token(),
        }});
    }
}
