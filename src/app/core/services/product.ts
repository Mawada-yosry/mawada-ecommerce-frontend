import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { env } from '../../../env/env';
import { IProduct, IProductMessageResponse, IProductStatusResponse } from '../models/product.model';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private apiURL = env.apiURL + 'product';
    constructor(private _http: HttpClient) {}
    getAllProducts(category?: string, subCategory?: string, keyword?: string, sort?: string) {
        let params = new HttpParams().set('limit', '100');
        if (category) {
            params = params.set('category', category);
        }
        if (subCategory) {
            params = params.set('subCategory', subCategory);
        }
        if (keyword) {
            params = params.set('keyword', keyword);
        }
        if (sort) {
            params = params.set('sort', sort);
        }
        return this._http.get<IProduct[]>(this.apiURL, { params });
    }
    getProductBySlug(slug: string) {
        return this._http.get<IProduct>(this.apiURL + '/slug/' + slug);
    }
    getAllProductsForAdmin(keyword?: string, category?: string, subCategory?: string) {
        let params = new HttpParams();
        if (keyword) {
            params = params.set('keyword', keyword);
        }
        if (category) {
            params = params.set('category', category);
        }
        if (subCategory) {
            params = params.set('subCategory', subCategory);
        }
        return this._http.get<IProduct[]>(this.apiURL + '/admin/all', { params });
    }
    createProduct(data: FormData) {
        return this._http.post<IProduct>(this.apiURL, data);
    }
    updateProduct(id: string, data: FormData) {
        return this._http.patch<IProduct>(this.apiURL + '/' + id, data);
    }
    updateProductStatus(id: string, isActive: boolean) {
        return this._http.patch<IProductStatusResponse>(this.apiURL + '/' + id + '/status', { isActive });
    }
    deleteProduct(id: string) {
        return this._http.delete<IProductMessageResponse>(this.apiURL + '/' + id);
    }
}