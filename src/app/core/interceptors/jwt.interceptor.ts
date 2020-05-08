import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '@core/services';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add authorization header with jwt token if available
        let currentUser = this.authService.currentUserValue;
        let currentUserTkn = this.authService.currentAccessValue;
        if (currentUser && currentUserTkn) {
            if (this.searchUrl(request.url)){
                request = request.clone({headers: new HttpHeaders({
                    'Cache-Control': 'no-store',
                    // 'Cache-Control': 'no-cache, max-age=0',
                    'Authorization': `Bearer ${currentUserTkn}`
                  })
                });
            } else {
                request = request.clone({
                    setHeaders: { 
                        Authorization: `Bearer ${currentUserTkn}`
                    }
                });
            }
        }
        return next.handle(request);
    }

    searchUrl(url: string) : boolean{
        let values: any [] = ['apps','products'];
        let exclude = false;
        let res: any = values.filter(option => option === url.split("/")[3]);

        if (res.length > 0){
            exclude = true;
        }
        return exclude;
    }
}