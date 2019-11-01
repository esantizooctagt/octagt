import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Tax } from '@app/_models';
import { catchError } from 'rxjs/operators';

@Injectable({ 
  providedIn: 'root' 
})
export class TaxService {
    readonly apiURL = environment.apiUrl;
    constructor(private http: HttpClient) { }
  
    getTaxes(companyId): Observable<Tax[]> {
      return this.http.get<Tax[]>(this.apiURL + '/taxes/' + companyId)
                      .pipe(catchError(this.errorHandler));
    }
  
    getTax(token, taxId): Observable<Tax> {
      return this.http.get<Tax>(this.apiURL + '/taxes/' + taxId, { headers: new HttpHeaders().set('Authorization', 'Basic ' + token) })
                      .pipe(catchError(this.errorHandler));
    }
  
    postTax(token, formData) {
        return this.http.post(this.apiURL + '/taxes', formData, { headers: new HttpHeaders().set('Authorization', 'Basic ' + token) })
                        .pipe(catchError(this.errorHandler));
    }

    putTax(taxId, token, formData) {
      return this.http.patch(this.apiURL + '/taxes'  + taxId, formData, { headers: new HttpHeaders().set('Authorization', 'Basic ' + token) })
                      .pipe(catchError(this.errorHandler));
    }
  
    deleteTax(token, taxId) {
      return this.http.delete(this.apiURL + '/taxes/' + taxId, { headers: new HttpHeaders().set('Authorization', 'Basic ' + token) })
                      .pipe(catchError(this.errorHandler));
    }

    errorHandler(error: HttpErrorResponse){
      return Observable.throw(error.message || 'Server Error');
    }
  }