import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { env } from '../../../env/env';
import { ICart } from '../../core/models/cart.model';
import { IGuestCartItem } from '../../core/models/guest-cart.model';
import { AuthService } from '../../core/services/auth';
import { CartService } from '../../core/services/cart';
import { GuestCartService } from '../../core/services/guest-cart';

@Component({
    selector: 'app-cart',
    imports: [RouterLink],
    templateUrl: './cart.html',
    styleUrl: './cart.css'
})
export class Cart implements OnInit, OnDestroy {
    cart: ICart | null = null;
    guestItems: IGuestCartItem[] = [];
    guestTotalItems = 0;
    guestTotalPrice = 0;
    isGuest = true;
    isLoading = true;
    errorMessage = '';
    successMessage = '';
    staticURL = env.staticURL;
    private subscriptions = new Subscription();

    constructor(private _cartService: CartService, private _guestCartService: GuestCartService, private _authService: AuthService, private _router: Router, private _cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.isGuest = !this._authService.isUser();

        if (this.isGuest) {
            this.loadGuestCart();
        } else {
            this.mergeAndLoadCart();
        }
    }

    loadGuestCart() {
        this.guestItems = this._guestCartService.getItems();
        this.guestTotalItems = this._guestCartService.getTotalItems();
        this.guestTotalPrice = this._guestCartService.getTotalPrice();
        this.isLoading = false;
        this._cdr.detectChanges();
    }

    mergeAndLoadCart() {
        if (this._guestCartService.getItems().length === 0) {
            this.getCart();
            return;
        }

        const mergeSubscription = this._guestCartService.mergeGuestCart().subscribe({
            next: () => {
                this.getCart();
            },
            error: err => {
                this.errorMessage = err.error?.message || 'Some guest cart products could not be merged';
                this.getCart();
            }
        });

        this.subscriptions.add(mergeSubscription);
    }

    getCart() {
        this.isLoading = true;

        const cartSubscription = this._cartService.getCart().subscribe({
            next: res => {
                this.cart = res;
                this.isLoading = false;
                this._cdr.detectChanges();
            },
            error: err => {
                this.isLoading = false;

                if (err.status === 404) {
                    this.cart = null;
                } else {
                    this.errorMessage = err.error?.message || 'Failed to load cart';
                }

                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(cartSubscription);
    }

    updateGuestQuantity(productId: string, value: string) {
        const quantity = Number(value);

        if (!Number.isInteger(quantity) || quantity < 1) {
            this.errorMessage = 'Quantity must be a positive integer';
            return;
        }

        const updated = this._guestCartService.updateQuantity(productId, quantity);

        if (!updated) {
            this.errorMessage = 'The requested quantity exceeds the available stock';
            return;
        }

        this.errorMessage = '';
        this.successMessage = 'Quantity updated successfully';
        this.loadGuestCart();
    }

    removeGuestItem(productId: string) {
        this._guestCartService.removeItem(productId);
        this.errorMessage = '';
        this.successMessage = 'Product removed from cart';
        this.loadGuestCart();
    }

    clearGuestCart() {
        this._guestCartService.clearCart();
        this.errorMessage = '';
        this.successMessage = 'Cart cleared successfully';
        this.loadGuestCart();
    }

    updateQuantity(productId: string, value: string) {
        const quantity = Number(value);

        if (!Number.isInteger(quantity) || quantity < 1) {
            this.errorMessage = 'Quantity must be a positive integer';
            return;
        }

        this.errorMessage = '';
        this.successMessage = '';

        const updateSubscription = this._cartService.updateCartItem(productId, quantity).subscribe({
            next: res => {
                this.cart = res;
                this.successMessage = 'Quantity updated successfully';
                this._cdr.detectChanges();
            },
            error: err => {
                this.errorMessage = err.error?.message || 'Failed to update quantity';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(updateSubscription);
    }

    acceptPriceChange(productId: string) {
        this.errorMessage = '';
        this.successMessage = '';

        const priceSubscription = this._cartService.acceptPriceChange(productId).subscribe({
            next: res => {
                this.cart = res.cart;
                this.successMessage = res.message;
                this._cdr.detectChanges();
            },
            error: err => {
                this.errorMessage = err.error?.message || 'Failed to accept new price';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(priceSubscription);
    }

    removeItem(productId: string) {
        this.errorMessage = '';
        this.successMessage = '';

        const removeSubscription = this._cartService.removeCartItem(productId).subscribe({
            next: res => {
                this.cart = res;
                this.successMessage = 'Product removed from cart';
                this._cdr.detectChanges();
            },
            error: err => {
                this.errorMessage = err.error?.message || 'Failed to remove product';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(removeSubscription);
    }

    clearCart() {
        this.errorMessage = '';
        this.successMessage = '';

        const clearSubscription = this._cartService.clearCart().subscribe({
            next: res => {
                this.cart = res.cart;
                this.successMessage = res.message;
                this._cdr.detectChanges();
            },
            error: err => {
                this.errorMessage = err.error?.message || 'Failed to clear cart';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(clearSubscription);
    }

    checkout() {
        if (this.isGuest) {
            this._router.navigate(['/login']);
            return;
        }

        this._router.navigate(['/checkout']);
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}