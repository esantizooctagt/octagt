import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Document } from '@app/_models';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({ 
  providedIn: 'root' 
})
export class DocumentService {
    readonly apiURL = environment.apiUrl;
    constructor(private http: HttpClient) { }
  
    getDocumentStore(storeId): Observable<Document> {
      return this.http.get<Document>(this.apiURL + '/document/store/' + storeId)
                      .pipe(catchError(this.errorHandler));
    }

    updateDocument(formData) {
      return this.http.patch(this.apiURL + '/document', formData)
                      .pipe(catchError(this.errorHandler));
    }
    errorHandler(error) {
      return throwError(error || 'Server Error');
    }
  }