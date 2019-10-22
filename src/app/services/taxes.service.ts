import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Tax } from '@app/_models';

@Injectable({ providedIn: 'root' })

export class TaxService {
    readonly apiURL = environment.apiUrl;
    constructor(private http: HttpClient) { }
  
    getTaxes(): Observable<any> {
      return this.http.get<any>(this.apiURL + '/taxes');
    }
  
    getTax(token, taxId): Observable<Tax[]> {
      return this.http.get<Tax[]>(this.apiURL + '/taxes/' + taxId, { headers: new HttpHeaders().set('Authorization', 'Basic ' + token) });
    }
  
    postTax(token, formData) {
        return this.http.post(this.apiURL + '/taxes', formData, { headers: new HttpHeaders().set('Authorization', 'Basic ' + token) });
    }

    putTax(token, formData) {
      return this.http.patch(this.apiURL + '/taxes', formData, { headers: new HttpHeaders().set('Authorization', 'Basic ' + token) });
    }
  
    deleteTax(token, taxId) {
      return this.http.delete(this.apiURL + '/taxes/' + taxId, { headers: new HttpHeaders().set('Authorization', 'Basic ' + token) });
    }
  }