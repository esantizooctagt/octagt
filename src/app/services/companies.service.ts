import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Company } from '@app/_models';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
    readonly apiURL = environment.apiUrl;
    constructor(private http: HttpClient) { }

    getCompany(companyId): Observable<Company> {
      return this.http.get<Company>(this.apiURL + '/company/' + companyId)
                      .pipe(catchError(this.errorHandler));
    }

    updateCompany(companyId, dataForm) {
      return this.http.patch(this.apiURL + '/company/' + companyId, dataForm)
                      .pipe(catchError(this.errorHandler));
    }

    errorHandler(error){
      return throwError(error || 'Server Error');
    }
}
