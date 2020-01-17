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

    getProducts(formData): Observable<Product[]> {
      return this.http.get<Product[]>(this.apiURL + '/products?' + formData)
                      .pipe(catchError(this.errorHandler));
    }

    getProduct(productId): Observable<Product> {
      return this.http.get<Product>(this.apiURL + '/product/' + productId)
                      .pipe(catchError(this.errorHandler));
    }

    postProduct(formData) {
        return this.http.post(this.apiURL + '/product', formData)
                        .pipe(catchError(this.errorHandler));
    }

    updateProduct(productId, formData) {
      return this.http.patch(this.apiURL + '/product/'  + productId, formData)
                      .pipe(catchError(this.errorHandler));
    }

    deleteProduct(productId) {
      return this.http.delete(this.apiURL + '/product/' + productId)
                      .pipe(catchError(this.errorHandler));
    }

    errorHandler(error) {
      return throwError(error || 'Server Error');
    }
}
