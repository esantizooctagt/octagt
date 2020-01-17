import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

    getCustomers(formData): Observable<Customer[]> {
      return this.http.get<Customer[]>(this.apiURL + '/customers?' + formData)
                      .pipe(catchError(this.errorHandler));
    }

    getCustomer(customerId): Observable<Customer> {
      return this.http.get<Customer>(this.apiURL + '/customer/' + customerId)
                      .pipe(catchError(this.errorHandler));
    }

    postCustomer(formData) {
        return this.http.post(this.apiURL + '/customer', formData)
                        .pipe(catchError(this.errorHandler));
    }

    updateCustomer(customerId, formData) {
      return this.http.patch(this.apiURL + '/customer/'  + customerId, formData)
                      .pipe(catchError(this.errorHandler));
    }

    deleteCustomer(customerId) {
      return this.http.delete(this.apiURL + '/customer/' + customerId)
                      .pipe(catchError(this.errorHandler));
    }

    errorHandler(error){
      return throwError(error || 'Server Error');
    }
}
