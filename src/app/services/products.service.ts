import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Product } from '@app/_models';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ProductService {

    readonly apiURL = environment.apiUrl;
    constructor(private http: HttpClient) { }

    getProducts(companyId, page, perPage, search): Observable<Product[]> {
      return this.http.get<Product[]>(this.apiURL + '/products/' + companyId + '/' + page + '/' + perPage + (search != '' ? '/' + search : ''))
                      .pipe(catchError(this.errorHandler));
    }

    getProduct(productId, token): Observable<Product> {
      return this.http.get<Product>(this.apiURL + '/product/' + productId, { headers: new HttpHeaders().set('Authorization', token) })
                      .pipe(catchError(this.errorHandler));
    }

    postProduct(token, formData) {
        return this.http.post(this.apiURL + '/product', formData, { headers: new HttpHeaders().set('Authorization', token) })
                        .pipe(catchError(this.errorHandler));
    }

    updateProduct(productId, token, formData) {
      return this.http.patch(this.apiURL + '/product/'  + productId, formData, { headers: new HttpHeaders().set('Authorization', token) })
                      .pipe(catchError(this.errorHandler));
    }

    deleteProduct(productId, token) {
      return this.http.delete(this.apiURL + '/product/' + productId, { headers: new HttpHeaders().set('Authorization', token) })
                      .pipe(catchError(this.errorHandler));
    }

    errorHandler(error) {
      return throwError(error || 'Server Error');
    }
}
