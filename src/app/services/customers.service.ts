import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Customer } from '@app/_models';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  readonly apiURL = environment.apiUrl;
    constructor(private http: HttpClient) { }

    getCustomers(companyId, page, perPage, search): Observable<Customer[]> {
      return this.http.get<Customer[]>(this.apiURL + '/customers/' + companyId + '/' + page + '/' + perPage + (search != '' ? '/' + search : ''))
                      .pipe(catchError(this.errorHandler));
    }

    getCustomer(customerId, token): Observable<Customer> {
      return this.http.get<Customer>(this.apiURL + '/customers/' + customerId, { headers: new HttpHeaders().set('Authorization', 'Bearer ' + token) })
                      .pipe(catchError(this.errorHandler));
    }

    postCustomer(token, formData) {
        return this.http.post(this.apiURL + '/customers', formData, { headers: new HttpHeaders().set('Authorization', 'Bearer ' + token) })
                        .pipe(catchError(this.errorHandler));
    }

    updateCustomer(customerId, token, formData) {
      return this.http.patch(this.apiURL + '/customers/'  + customerId, formData, { headers: new HttpHeaders().set('Authorization', 'Bearer ' + token) })
                      .pipe(catchError(this.errorHandler));
    }

    deleteCustomer(customerId, token) {
      return this.http.delete(this.apiURL + '/customers/' + customerId, { headers: new HttpHeaders().set('Authorization', 'Bearer ' + token) })
                      .pipe(catchError(this.errorHandler));
    }

    errorHandler(error: HttpErrorResponse){
      return throwError(error.message || 'Server Error');
    }
}
