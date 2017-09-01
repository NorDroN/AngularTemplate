import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { AuthenticationService } from "../services";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private injector: Injector) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let authenticationService = this.injector.get(AuthenticationService);
        if (authenticationService.accessToken)
            req = req.clone({ headers: req.headers.set('Authorization', "Bearer " + authenticationService.accessToken) });
        return next.handle(req);
    }

}