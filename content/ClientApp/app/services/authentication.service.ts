import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map'

import { JwtHelper, LocalStoreManager, DBkeys } from "../utilities";
import { User } from "../models";

@Injectable()
export class AuthenticationService {

    get currentUser(): User | undefined {
        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        this.reevaluateLoginStatus(user);
        return user;
    }

    get isLoggedIn(): boolean {
        return this.currentUser != null;
    }

    get accessToken(): string {
        this.reevaluateLoginStatus();
        return this.localStorage.getData(DBkeys.ACCESS_TOKEN);
    }

    get loginUrl() { return this.baseUrl + 'connect/token'; };
    get registerUrl() { return this.baseUrl + 'register'; }

    private previousIsLoggedInCheck = false;
    private _loginStatus = new Subject<boolean>();

    constructor(
        private http: HttpClient,
        @Inject('BASE_URL') private baseUrl: string,
        private localStorage: LocalStoreManager) { }

    register(model: any) {
        return this.http
            .post(this.registerUrl, model);
    }

    login(username: string, password: string, rememberMe: boolean = false) {
        let headers = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");

        let params = new HttpParams()
            .set('username', username)
            .set('password', password)
            .set('grant_type', 'password')
            .set('scope', 'openid email profile roles')
            .set('resource', window.location.origin);

        return this.http
            .post(this.loginUrl, params, { headers: headers })
            .map(response => this.processLoginResponse(response, rememberMe));
    }

    logout() {
        this.clearUserDetails();
        this.reevaluateLoginStatus();
    }

    getLoginStatusEvent(): Observable<boolean> {
        return this._loginStatus.asObservable();
    }

    private processLoginResponse(response_token: any, rememberMe: boolean) {
        let accessToken = response_token.access_token;
        if (accessToken == null)
            throw new Error("Received accessToken was empty");

        let idToken: string = response_token.id_token;
        let refreshToken: string = response_token.refresh_token;
        let expiresIn: number = response_token.expires_in;

        let tokenExpiryDate = new Date();
        tokenExpiryDate.setSeconds(tokenExpiryDate.getSeconds() + expiresIn);

        let accessTokenExpiry = tokenExpiryDate;

        let jwtHelper = new JwtHelper();
        let decodedIdToken = jwtHelper.decodeToken(response_token.id_token);

        //let permissions: PermissionValues[] = Array.isArray(decodedIdToken.permission) ? decodedIdToken.permission : [decodedIdToken.permission];

        let user: User = {
            id: decodedIdToken.sub,
            username: decodedIdToken.name,
            email: decodedIdToken.email
        };
        
        //user.roles = Array.isArray(decodedIdToken.role) ? decodedIdToken.role : [decodedIdToken.role];

        this.saveUserDetails(user, accessToken, idToken, refreshToken, accessTokenExpiry, rememberMe);

        this.reevaluateLoginStatus(user);

        return user;
    }

    private saveUserDetails(user: User, accessToken: string, idToken: string, refreshToken: string, expiresIn: Date, rememberMe: boolean) {
        if (rememberMe) {
            this.localStorage.savePermanentData(accessToken, DBkeys.ACCESS_TOKEN);
            this.localStorage.savePermanentData(idToken, DBkeys.ID_TOKEN);
            this.localStorage.savePermanentData(refreshToken, DBkeys.REFRESH_TOKEN);
            this.localStorage.savePermanentData(expiresIn, DBkeys.TOKEN_EXPIRES_IN);
            this.localStorage.savePermanentData(user, DBkeys.CURRENT_USER);
        }
        else {
            this.localStorage.saveSyncedSessionData(accessToken, DBkeys.ACCESS_TOKEN);
            this.localStorage.saveSyncedSessionData(idToken, DBkeys.ID_TOKEN);
            this.localStorage.saveSyncedSessionData(refreshToken, DBkeys.REFRESH_TOKEN);
            this.localStorage.saveSyncedSessionData(expiresIn, DBkeys.TOKEN_EXPIRES_IN);
            this.localStorage.saveSyncedSessionData(user, DBkeys.CURRENT_USER);
        }

        this.localStorage.savePermanentData(rememberMe, DBkeys.REMEMBER_ME);
    }

    private clearUserDetails(): void {
        this.localStorage.deleteData(DBkeys.ACCESS_TOKEN);
        this.localStorage.deleteData(DBkeys.ID_TOKEN);
        this.localStorage.deleteData(DBkeys.REFRESH_TOKEN);
        this.localStorage.deleteData(DBkeys.TOKEN_EXPIRES_IN);
        this.localStorage.deleteData(DBkeys.USER_PERMISSIONS);
        this.localStorage.deleteData(DBkeys.CURRENT_USER);
    }

    private reevaluateLoginStatus(currentUser?: User) {
        let user = currentUser || this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        let isLoggedIn = user != null;

        if (this.previousIsLoggedInCheck != isLoggedIn) {
            setTimeout(() => {
                this._loginStatus.next(isLoggedIn);
            });
        }

        this.previousIsLoggedInCheck = isLoggedIn;
    }

}
