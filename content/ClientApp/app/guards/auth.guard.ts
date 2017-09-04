﻿import { Injectable, Injector } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthenticationService } from "../services";
 
@Injectable()
export class AuthGuard implements CanActivate {
 
    constructor(private router: Router, private injector: Injector) { }
 
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let authenticationService = this.injector.get(AuthenticationService);
        if (authenticationService.isLoggedIn) {
            // logged in so return true
            return true;
        }
 
        // not logged in so redirect to login page with the return url
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
        return false;
    }

}
