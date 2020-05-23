import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { User, Currency } from '@app/_models';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })

export class AuthService {
    private currentUserSubject: BehaviorSubject<User>;
    private currentUserTknSubject: BehaviorSubject<any>;
    private currentAccessTknSubject: BehaviorSubject<any>;

    public currentUser: Observable<User>;
    public currentTkn: Observable<any>;
    public currentAccessTkn: Observable<any>;

    readonly apiURL = environment.apiUrl;
    currencies: Currency[]=environment.currencies.sort((a, b) => (a.name > b.name) ? 1 : -1);

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(sessionStorage.getItem('OCT_USS')));
        this.currentUser = this.currentUserSubject.asObservable();

        this.currentUserTknSubject = new BehaviorSubject<User>(JSON.parse(sessionStorage.getItem('OCT_TKN')));
        this.currentTkn = this.currentUserTknSubject.asObservable();

        this.currentAccessTknSubject = new BehaviorSubject<User>(JSON.parse(sessionStorage.getItem('OCT_ACT')));
        this.currentAccessTkn = this.currentAccessTknSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    public get currentUserTknValue(): any {
        return this.currentUserTknSubject.value;
    }

    public get currentAccessValue(): any{
        return this.currentAccessTknSubject.value;
    }

    login(userName: string, password: string, authCode: string) {
        // const  headers = new HttpHeaders({'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With'})
        return this.http.post<any>(this.apiURL + '/user/login', { "UserName": userName, "Password": password, "MFact_Auth": authCode }) // {headers})
            .pipe(
                map(user => {
                    if (user && user.token && user.Code == 100) {
                        // store user details in local storage to keep user logged in
                        sessionStorage.setItem('OCT_USS', JSON.stringify(user.user));
                        this.currentUserSubject.next(user.user);
                        sessionStorage.setItem('OCT_TKN', JSON.stringify(user.token));
                        this.currentUserTknSubject.next(user.token);
                        sessionStorage.setItem('OCT_ACT', JSON.stringify(user.access));
                        this.currentAccessTknSubject.next(user.access);
                    }
                    return user;
                })
            );
    }

    companyId() {
        let user = JSON.parse(sessionStorage.getItem('OCT_USS'));
        return user.Company_Id;
    }

    userId(){
        let user = JSON.parse(sessionStorage.getItem('OCT_USS'));
        return user.User_Id;
    }
    
    userName(){
        let user = JSON.parse(sessionStorage.getItem('OCT_USS'));
        return user.User_Name;
    }

    storeId(){
        let user = JSON.parse(sessionStorage.getItem('OCT_USS'));
        return user.Store_Id;
    }

    currentToken() {
        return this.currentUserTknSubject.value;
    }

    currentAccessToken(){
        return this.currentAccessTknSubject.value;
    }

    roleId(){
        let user = JSON.parse(sessionStorage.getItem('OCT_USS'));
        return user.Role_Id;
    }

    currency() {
        let user = JSON.parse(sessionStorage.getItem('OCT_USS'));
        let curr: Currency[];
        let curStr = '';
        curr = this.currencies.filter(currency => currency.c.indexOf(user.Currency) === 0);
        if (curr.length > 0) {
            curStr = curr[0].n;
        }
        return curStr;
    }

    language() {
        let user = JSON.parse(sessionStorage.getItem('OCT_USS'));
        return user.Language_Id;
    }

    country() {
        let user = JSON.parse(sessionStorage.getItem('OCT_USS'));
        return user.Country;
    }

    avatar(){
        let user = JSON.parse(sessionStorage.getItem('OCT_USS'));
        return user.Avatar;
    }

    cashier(){
        let user = JSON.parse(sessionStorage.getItem('OCT_USS'));
        return user.Cashier_Id;
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
        sessionStorage.removeItem('OCT_ACT');
        this.currentAccessTknSubject.next(null);
    }
}