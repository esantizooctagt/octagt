import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { catchError, retry } from 'rxjs/operators';
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

    getInvoices(formData){
      return this.http.get(this.apiURL + '/sales?'+ formData)
                      .pipe(retry(1), catchError(this.errorHandler));
    }

    getInvoice(id){
      return this.http.get(this.apiURL + '/sales/'+ id)
                      .pipe(retry(1), catchError(this.errorHandler));
    }

    updatePayment(invoiceId){
      return this.http.patch(this.apiURL + '/sale/'+invoiceId,'')
                      .pipe(catchError(this.errorHandler));
    }

    voidInvoice(invoiceId){
      return this.http.put(this.apiURL + '/sale/'+invoiceId,'')
                      .pipe(catchError(this.errorHandler));
    }

    errorHandler(error) {
      return throwError(error || 'Server Error');
    }
}
