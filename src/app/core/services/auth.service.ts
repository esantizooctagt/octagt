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
        return this.http.post<any>(this.apiURL + '/user/login', { "UserName": userName, "Password": password })
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

    userId(){
        let user = JSON.parse(sessionStorage.getItem('OCT_USS'));
        return user.User_Id;
    }

    storeId(){
        let user = JSON.parse(sessionStorage.getItem('OCT_USS'));
        return user.Store_Id;
    }

    currentToken() {
        return this.currentUserTknSubject.value;
    }

    roleId(){
        let user = JSON.parse(sessionStorage.getItem('OCT_USS'));
        return user.Role_Id;
    }

    currency() {
        let user = JSON.parse(sessionStorage.getItem('OCT_USS'));
        return user.Currency;
    }

    country() {
        let user = JSON.parse(sessionStorage.getItem('OCT_USS'));
        return user.Country;
    }

    avatar(){
        let user = JSON.parse(sessionStorage.getItem('OCT_USS'));
        return user.Avatar;
    }

    get userAvatar() {
        if (sessionStorage.getItem('OCT_USS') != null) {
          var user = JSON.parse(sessionStorage.getItem('OCT_USS'));
          if (user.Avatar !== null) {
            return environment.bucket + user.Avatar;
          }
        }
        return null;
      }

    getUserProfile() {
        if (sessionStorage.getItem('OCT_USS') != null) {
          var user = JSON.parse(sessionStorage.getItem('OCT_USS'));
          return user;
        }
        return null;
    }

    setUserAvatar(imgUrl) {
        if (this.getUserProfile() != null) {
          var user = this.getUserProfile();
          user.Avatar = imgUrl;
          this.setUserProfile(user);
        }
    }

    setUserProfile(userProfile) {
        sessionStorage.setItem('OCT_USS', JSON.stringify(userProfile));
    }

    isAdmin(){
        let user = JSON.parse(sessionStorage.getItem('OCT_USS'));
        return user.Is_Admin;
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