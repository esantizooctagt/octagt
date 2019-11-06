import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '@app/_models';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })

export class AuthService {
    private currentUserSubject: BehaviorSubject<User>;
    private currentUserTknSubject: BehaviorSubject<any>;

    public currentUser: Observable<User>;
    public currentTkn: Observable<any>;
    readonly apiURL = environment.apiUrl;

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(sessionStorage.getItem('OCT_USS')));
        this.currentUser = this.currentUserSubject.asObservable();

        this.currentUserTknSubject = new BehaviorSubject<User>(JSON.parse(sessionStorage.getItem('OCT_TKN')));
        this.currentTkn = this.currentUserTknSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    public get currentUserTknValue(): any {
        return this.currentUserTknSubject.value;
    }

    login(userName: string, password: string) {
        return this.http.post<any>(this.apiURL + '/users/login', { userName, password })
            .pipe(map(user => {
                if (user && user.token) {
                    // store user details in local storage to keep user logged in
                    sessionStorage.setItem('OCT_USS', JSON.stringify(user.user));
                    this.currentUserSubject.next(user.user);
                    sessionStorage.setItem('OCT_TKN', JSON.stringify(user.token));
                    this.currentUserTknSubject.next(user.token);
                }

                return user;
            }));
    }

    companyId() {
        let user = JSON.parse(sessionStorage.getItem('OCT_USS'));
        return user.Company_Id;
    }

    currentToken() {
        return this.currentUserTknSubject.value;
    }

    logout() {
        // remove user data from local storage for log out
        //Session Storage works when a user closed tab or browser
        //LocalStorage save data inclusive when tab or browser closed
        sessionStorage.removeItem('OCT_USS');
        this.currentUserSubject.next(null);
        sessionStorage.removeItem('OCT_TKN');
        this.currentUserTknSubject.next(null);
    }
}