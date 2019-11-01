import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { User } from '@app/_models/user';
import { environment } from '@environments/environment';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ 
    providedIn: 'root' 
})
export class UserService {
    readonly apiURL = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<User[]>(this.apiURL + `users`)
                        .pipe(catchError(this.errorHandler));
    }

    register(user: User) {
        return this.http.post(this.apiURL + `auth/register`, user)
                        .pipe(catchError(this.errorHandler));
    }

    delete(id: number) {
        return this.http.delete(this.apiURL + `users/${id}`)
                        .pipe(catchError(this.errorHandler));
    }

    errorHandler(error: HttpErrorResponse){
        return Observable.throw(error.message || 'Server Error');
      }
}