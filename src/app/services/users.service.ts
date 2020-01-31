import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { User } from '@app/_models';
import { catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
    readonly apiURL = environment.apiUrl;
    constructor(private http: HttpClient) { }

    getUser(userId): Observable<User> {
        return this.http.get<User>(this.apiURL + '/user/' + userId)
                        .pipe(catchError(this.errorHandler));
    }

    errorHandler(error) {
      return throwError(error || 'Server Error');
    }
}
