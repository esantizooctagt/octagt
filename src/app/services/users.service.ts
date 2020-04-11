import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { User } from '@app/_models';
import { catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
    readonly apiURL = environment.apiUrl;
    readonly apiLocUrl = environment.apiLocUrl;
    constructor(private http: HttpClient) { }

    getUser(userId): Observable<User> {
        return this.http.get<User>(this.apiURL + '/user/' + userId)
                        .pipe(catchError(this.errorHandler));
    }

    uploadImage(userId, formData){
      return this.http.patch(this.apiURL + '/user/' + userId, formData)
                        .pipe(catchError(this.errorHandler));
    }

    updateUser(userId, formData){
      return this.http.put(this.apiURL + '/user/' + userId, formData)
                        .pipe(catchError(this.errorHandler));
    }

    getUsers(formData): Observable<User[]> {
      return this.http.get<User[]>(this.apiURL + '/users/' + formData)
                      .pipe(catchError(this.errorHandler));
    }
  
    postUser(formData) {
        return this.http.post(this.apiURL + '/user', formData)
                        .pipe(catchError(this.errorHandler));
    }
  
    deleteUser(userId) {
      return this.http.delete(this.apiURL + '/user/' + userId)
                      .pipe(catchError(this.errorHandler));
    }

    validateUserName(username){
      return this.http.get(this.apiURL + '/user/validate/' + username)
                      .pipe(catchError(this.errorHandler));
    }

    forgotPassword(formData){
      return this.http.post(this.apiURL + '/user/forgotpassword', formData)
                      .pipe(catchError(this.errorHandler));
    }

    getUserIP(){
      return this.http.get('https://api.ipify.org/?format=json')
                      .pipe(catchError(this.errorHandler));
    }

    getUserLocation(ipAddress: string){
      return this.http.get('http://api.ipapi.com/'+ipAddress+'?access_key='+this.apiLocUrl)
                      .pipe(catchError(this.errorHandler));
    }

    errorHandler(error) {
      return throwError(error || 'Server Error');
    }
}
