import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Cashier } from '@app/_models';
import { catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CashiersService {
    readonly apiURL = environment.apiUrl;
    constructor(private http: HttpClient) { }

    getCashiers(companyId): Observable<Cashier> {
        return this.http.get<Cashier>(this.apiURL + '/cashiers?companyId=' + companyId)
                        .pipe(catchError(this.errorHandler));
    }

    getCashiersStore(storeId): Observable<Cashier[]>{
      return this.http.get<Cashier[]>(this.apiURL + '/cashiers/store/' + storeId)
                      .pipe(catchError(this.errorHandler));
    }

    updateCashiers(dataForm){
      return this.http.patch(this.apiURL + '/cashiers', dataForm)
                      .pipe(catchError(this.errorHandler));
    }

    postCashier(cashierId, dataForm): Observable<any> {
      return this.http.post(this.apiURL + '/cashier/' + cashierId, dataForm)
                      .pipe(catchError(this.errorHandler));
    }

    updCashier(cashierId): Observable<any> {
      return this.http.patch(this.apiURL + '/cashier/' + cashierId, '')
                      .pipe(catchError(this.errorHandler));
    }
    
    errorHandler(error) {
      return throwError(error || 'Server Error');
    }
}
