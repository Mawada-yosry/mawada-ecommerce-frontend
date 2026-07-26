import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, tap } from 'rxjs';
import { env } from '../../../env/env';
import { IChangePasswordData, IJWT, ILoginData, ILoginResponse, IMessageResponse, IProfileResponse, IRegisterData, IUpdateProfileData, IUser } from '../models/user.model';
@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private loginURL = env.apiURL + 'auth/login';
    private registerURL = env.apiURL + 'user';
    private tokenKey = 'token';
    private authState = new BehaviorSubject<string | null>(null);
    constructor(private _http: HttpClient, private _router: Router) {}
    register(data: IRegisterData) {
        return this._http.post<IUser>(this.registerURL, data);
    }
    login(data: ILoginData) {
        return this._http.post<ILoginResponse>(this.loginURL, data).pipe(tap(res => {
            const token = res.JWT;
            this.storeToken(token);
            const decodedToken = this.jwtDecoding(token);
            if (decodedToken) {
                this.authState.next(decodedToken.name);
                if (decodedToken.role === 'admin') {
                    this._router.navigate(['/dashboard', 'home']);
                } else {
                    this._router.navigate(['/home']);
                }
            }
        }));
    }
    isUser(): 'user' | 'admin' | null {
        const token = this.getToken();
        if (!token) {
            return null;
        }
        const decodedToken = this.jwtDecoding(token);
        return decodedToken ? decodedToken.role : null;
    }
    isLoggedIn() {
        return this.authState.asObservable();
    }
    onInitAuth() {
        const token = this.getToken();
        if (!token) {
            this.authState.next(null);
            return;
        }
        const decodedToken = this.jwtDecoding(token);
        if (decodedToken) {
            this.authState.next(decodedToken.name);
        } else {
            this.deleteToken();
            this.authState.next(null);
        }
    }
    jwtDecoding(token: string): IJWT | null {
        try {
            const decodedToken = jwtDecode<IJWT>(token);
            const expiryDate = decodedToken.exp * 1000;
            if (Date.now() >= expiryDate) {
                return null;
            }
            return decodedToken;
        } catch {
            return null;
        }
    }
    private storeToken(token: string) {
        localStorage.setItem(this.tokenKey, token);
    }
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }
    private deleteToken() {
        localStorage.removeItem(this.tokenKey);
    }
    logout() {
        this.deleteToken();
        this.authState.next(null);
        this._router.navigate(['/home']);
    }
private profileURL = env.apiURL + 'user/profile';
private changePasswordURL = env.apiURL + 'user/change-password';
getProfile() {
    return this._http.get<IProfileResponse>(this.profileURL);
}
updateProfile(data: IUpdateProfileData) {
    return this._http.patch<IProfileResponse>(this.profileURL, data).pipe(tap(res => {
        this.authState.next(res.data.name);
    }));
}
changePassword(data: IChangePasswordData) {
    return this._http.patch<IMessageResponse>(this.changePasswordURL, data);
}
}

