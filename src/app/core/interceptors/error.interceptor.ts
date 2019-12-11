import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from '@core/services';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            if (err.status === 401) {
                // auto logout if 401 response returned from api
                this.authService.logout();
                location.reload(true);
            }
            let message = err.error.message || err.statusText;
            if (err.status === 404) {
                message = err.error.Message;
                // console.log('Error interceptor before throw' + err.message);
                // console.log(JSON.stringify(next));
                // error = "No mames pinche buey";
            }
            let error = {  
                'Message': message,
                'Status' : err.status
            };
            //console.log('Variable:'+JSON.stringify(err.error.Message));
            return throwError(error);
        }))
    }
}