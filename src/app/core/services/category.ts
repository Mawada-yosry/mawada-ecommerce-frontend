import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { env } from '../../../env/env';
import { ICategory, ICategoryData, ICategoryMessageResponse, ICategoryStatusResponse, ISubCategory, ISubCategoryData, ISubCategoryMessageResponse, ISubCategoryStatusResponse } from '../models/category.model';

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private categoryURL = env.apiURL + 'category';
    private subCategoryURL = env.apiURL + 'subCategory';
    constructor(private _http: HttpClient) {}
    getCategories() {
        return this._http.get<ICategory[]>(this.categoryURL);
    }
    getCategoryBySlug(slug: string) {
        return this._http.get<ICategory>(this.categoryURL + '/slug/' + slug);
    }
    getSubCategoriesByCategory(categoryId: string) {
        return this._http.get<ISubCategory[]>(this.subCategoryURL + '/category/' + categoryId);
    }
    getAllCategoriesForAdmin() {
        return this._http.get<ICategory[]>(this.categoryURL + '/admin/all');
    }
    createCategory(data: ICategoryData) {
        return this._http.post<ICategory>(this.categoryURL, data);
    }
    updateCategory(id: string, data: ICategoryData) {
        return this._http.patch<ICategory>(this.categoryURL + '/' + id, data);
    }
    updateCategoryStatus(id: string, isActive: boolean) {
        return this._http.patch<ICategoryStatusResponse>(this.categoryURL + '/' + id + '/status', { isActive });
    }
    deleteCategory(id: string) {
        return this._http.delete<ICategoryMessageResponse>(this.categoryURL + '/' + id);
    }
    getAllSubCategoriesForAdmin() {
        return this._http.get<ISubCategory[]>(this.subCategoryURL + '/admin/all');
    }
    createSubCategory(data: ISubCategoryData) {
        return this._http.post<ISubCategory>(this.subCategoryURL, data);
    }
    updateSubCategory(id: string, data: ISubCategoryData) {
        return this._http.patch<ISubCategory>(this.subCategoryURL + '/' + id, data);
    }
    updateSubCategoryStatus(id: string, isActive: boolean) {
        return this._http.patch<ISubCategoryStatusResponse>(this.subCategoryURL + '/' + id + '/status', { isActive });
    }
    deleteSubCategory(id: string) {
        return this._http.delete<ISubCategoryMessageResponse>(this.subCategoryURL + '/' + id);
    }
}