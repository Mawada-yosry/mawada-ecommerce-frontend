import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { env } from '../../../env/env';
import { IDynamicPage, IDynamicPageData, IDynamicPageMessageResponse, IDynamicPageStatusResponse } from '../models/dynamic-page.model';

@Injectable({
    providedIn: 'root'
})
export class DynamicPageService {
    private apiURL = env.apiURL + 'page';
    constructor(private _http: HttpClient) {}
    getActivePages() {
        return this._http.get<IDynamicPage[]>(this.apiURL);
    }
    getPageByKey(pageKey: string) {
        return this._http.get<IDynamicPage>(this.apiURL + '/' + pageKey);
    }
    getAllPagesForAdmin() {
        return this._http.get<IDynamicPage[]>(this.apiURL + '/admin/all');
    }
    getPageByIdForAdmin(id: string) {
        return this._http.get<IDynamicPage>(this.apiURL + '/admin/' + id);
    }
    createPage(data: IDynamicPageData) {
        return this._http.post<IDynamicPage>(this.apiURL, data);
    }
    updatePage(id: string, data: IDynamicPageData) {
        return this._http.patch<IDynamicPage>(this.apiURL + '/' + id, data);
    }
    updatePageStatus(id: string, isActive: boolean) {
        return this._http.patch<IDynamicPageStatusResponse>(this.apiURL + '/' + id + '/status', { isActive });
    }
    deletePage(id: string) {
        return this._http.delete<IDynamicPageMessageResponse>(this.apiURL + '/' + id);
    }
}