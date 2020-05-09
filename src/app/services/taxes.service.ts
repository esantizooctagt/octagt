import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Tax } from '@app/_models';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({ 
  providedIn: 'root' 
})
export class TaxService {
    readonly apiURL = environment.apiUrl;
    constructor(private http: HttpClient) { }
  
    getTaxes(formData): Observable<Tax[]> {
      return this.http.get<Tax[]>(this.apiURL + '/taxes/' + formData)
                      .pipe(catchError(this.errorHandler));
    }
  
    getTax(taxId, companyId): Observable<Tax> {
      return this.http.get<Tax>(this.apiURL + '/tax/' + taxId + '/' + companyId)//, { headers: new HttpHeaders().set('Authorization', token) })
                      .pipe(catchError(this.errorHandler));
    }
  
    postTax(formData) {
        return this.http.post(this.apiURL + '/tax', formData)
                        .pipe(catchError(this.errorHandler));
    }

    updateTax(taxId, companyId, formData) {
      return this.http.patch(this.apiURL + '/tax/'  + taxId + '/' + companyId, formData)
                      .pipe(catchError(this.errorHandler));
    }
  
    deleteTax(taxId, companyId) {
      return this.http.delete(this.apiURL + '/tax/' + taxId + '/' + companyId)
                      .pipe(catchError(this.errorHandler));
    }

    errorHandler(error) {
      return throwError(error || 'Server Error');
    }
  }