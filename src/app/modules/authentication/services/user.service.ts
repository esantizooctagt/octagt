import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User } from '@app/_models/user';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
    readonly apiURL = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<User[]>(this.apiURL + `users`);
    }

    register(user: User) {
        return this.http.post(this.apiURL + `auth/register`, user);
    }

    delete(id: number) {
        return this.http.delete(this.apiURL + `users/${id}`);
    }
}