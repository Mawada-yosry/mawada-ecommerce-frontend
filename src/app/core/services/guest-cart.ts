import { Injectable } from '@angular/core';
import { concatMap, from, of, tap, toArray } from 'rxjs';
import { IGuestCartItem } from '../models/guest-cart.model';
import { IProduct } from '../models/product.model';
import { CartService } from './cart';

@Injectable({
    providedIn: 'root'
})
export class GuestCartService {
    private storageKey = 'guestCart';
    constructor(private _cartService: CartService) {}
    getItems(): IGuestCartItem[] {
        const cart = localStorage.getItem(this.storageKey);
        if (!cart) {
            return [];
        }
        try {
            return JSON.parse(cart) as IGuestCartItem[];
        } catch {
            localStorage.removeItem(this.storageKey);
            return [];
        }
    }
    saveItems(items: IGuestCartItem[]) {
        localStorage.setItem(this.storageKey, JSON.stringify(items));
    }
    addToCart(product: IProduct, quantity: number = 1) {
        if (product.stockQuantity === 0 || quantity < 1) {
            return false;
        }
        const items = this.getItems();
        const existingItem = items.find(item => item.product._id === product._id);
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > product.stockQuantity) {
                return false;
            }
            existingItem.quantity = newQuantity;
        } else {
            if (quantity > product.stockQuantity) {
                return false;
            }
            items.push({
                product,
                quantity
            });
        }
        this.saveItems(items);
        return true;
    }
    updateQuantity(productId: string, quantity: number) {
        const items = this.getItems();
        const item = items.find(cartItem => cartItem.product._id === productId);
        if (!item || quantity < 1 || quantity > item.product.stockQuantity) {
            return false;
        }
        item.quantity = quantity;
        this.saveItems(items);
        return true;
    }
    removeItem(productId: string) {
        const items = this.getItems().filter(item => item.product._id !== productId);
        this.saveItems(items);
    }
    clearCart() {
        localStorage.removeItem(this.storageKey);
    }
    getTotalItems() {
        return this.getItems().reduce((total, item) => total + item.quantity, 0);
    }
    getTotalPrice() {
        return this.getItems().reduce((total, item) => total + item.product.price * item.quantity, 0);
    }
    mergeGuestCart() {
        const items = this.getItems();
        if (items.length === 0) {
            return of([]);
        }
        return from(items).pipe(
            concatMap(item => this._cartService.addToCart(item.product._id, item.quantity).pipe(
                tap(() => this.removeItem(item.product._id))
            )),
            toArray()
        );
    }
}