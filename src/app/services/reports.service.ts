import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  readonly apiURL = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getSalesbyDay(companyId): Observable<any[]> {
    return this.http.get<any[]>(this.apiURL + '/reports/salesbyday/' + companyId)
                    .pipe(catchError(this.errorHandler));
  }

  getTopProducts(companyId): Observable<any[]> {
    return this.http.get<any[]>(this.apiURL + '/reports/topproducts/' + companyId)
                    .pipe(catchError(this.errorHandler));
  }

  getSalesByMonth(companyId): Observable<any>{
    return this.http.get<any[]>(this.apiURL + '/reports/monthsales/' + companyId)
                    .pipe(catchError(this.errorHandler));
  }

  getCashierDay(companyId): Observable<any>{
    return this.http.get<any[]>(this.apiURL + '/reports/cashiersale/' + companyId)
                    .pipe(catchError(this.errorHandler));
  }

  errorHandler(error) {
    return throwError(error || 'Server Error');
  }
}