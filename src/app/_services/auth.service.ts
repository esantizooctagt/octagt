import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '@app/_models';

@Injectable({ providedIn: 'root' })

export class AuthService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('OCT_USS')));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(email: string, password: string) {
        return this.http.post<any>(`auth/login`, { email, password })
            .pipe(map(user => {
                if (user && user.token) {
                    // store user details in local storage to keep user logged in
                    localStorage.setItem('OCT_USS', JSON.stringify(user.result));
                    this.currentUserSubject.next(user);
                }

                return user;
            }));
    }

    logout() {
        // remove user data from local storage for log out
        localStorage.removeItem('OCT_USS');
        this.currentUserSubject.next(null);
    }
}