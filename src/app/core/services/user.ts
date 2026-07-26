import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { env } from '../../../env/env';
import { IUserResponse, IUsersResponse } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiURL = env.apiURL + 'user';
    constructor(private _http: HttpClient) {}
    getUsers() {
        return this._http.get<IUsersResponse>(this.apiURL);
    }
    updateUserStatus(id: string, isActive: boolean) {
        return this._http.patch<IUserResponse>(this.apiURL + '/' + id + '/status', { isActive });
    }
    deleteUser(id: string) {
        return this._http.delete<IUserResponse>(this.apiURL + '/' + id);
    }
}