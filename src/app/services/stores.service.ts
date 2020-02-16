import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Store, StoreDocto } from '@app/_models';
import { catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StoresService {
    readonly apiURL = environment.apiUrl;
    constructor(private http: HttpClient) { }

    getStores(companyId): Observable<Store> {
        return this.http.get<Store>(this.apiURL + '/stores?companyId=' + companyId)
                        .pipe(catchError(this.errorHandler));
    }

    getStoresDoctos(companyId): Observable<StoreDocto[]> {
      return this.http.get<StoreDocto[]>(this.apiURL + '/stores/company/' + companyId)
                      .pipe(catchError(this.errorHandler));
    }

    updateStores(dataForm){
      return this.http.patch(this.apiURL + '/stores', dataForm)
                      .pipe(catchError(this.errorHandler));
    }

    updateStoreCashier(dataForm){
      return this.http.put(this.apiURL + '/stores', dataForm)
                      .pipe(catchError(this.errorHandler));
    }
    
    errorHandler(error) {
      return throwError(error || 'Server Error');
    }
}
