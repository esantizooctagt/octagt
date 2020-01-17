import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
    readonly apiURL = environment.apiUrl;
    constructor(private http: HttpClient) { }

    postSale(formData) {
        return this.http.post(this.apiURL + '/sales', formData)
                        .pipe(catchError(this.errorHandler));
    }

    errorHandler(error) {
      return throwError(error || 'Server Error');
    }
}
