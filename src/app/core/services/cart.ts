import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { env } from '../../../env/env';
import { IAcceptPriceResponse, ICart, IClearCartResponse } from '../models/cart.model';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private apiURL = env.apiURL + 'cart';
    constructor(private _http: HttpClient) {}
    getCart() {
        return this._http.get<ICart>(this.apiURL);
    }
    addToCart(productId: string, quantity: number = 1) {
        return this._http.post<ICart>(this.apiURL, { productId, quantity });
    }
    updateCartItem(productId: string, quantity: number) {
        return this._http.patch<ICart>(this.apiURL + '/' + productId, { quantity });
    }
    acceptPriceChange(productId: string) {
        return this._http.patch<IAcceptPriceResponse>(this.apiURL + '/' + productId + '/accept-price', {});
    }
    removeCartItem(productId: string) {
        return this._http.delete<ICart>(this.apiURL + '/' + productId);
    }
    clearCart() {
       return this._http.delete<IClearCartResponse>(this.apiURL);
    }
}