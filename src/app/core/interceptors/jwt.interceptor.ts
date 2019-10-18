import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthService } from '@core/services';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add authorization header with jwt token if available
        let currentUser = this.authService.currentUserValue;
        let currentUserTkn = this.authService.currentUserTknValue;
        if (currentUser && currentUserTkn.token) {
            request = request.clone({
                setHeaders: { 
                    Authorization: `Bearer ${currentUserTkn.token}`
                }
            });
        }

        return next.handle(request);
    }
}