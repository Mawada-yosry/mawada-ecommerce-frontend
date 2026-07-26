import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { env } from '../../../env/env';
import { IProduct } from '../../core/models/product.model';
import { AuthService } from '../../core/services/auth';
import { CartService } from '../../core/services/cart';
import { GuestCartService } from '../../core/services/guest-cart';
import { ProductService } from '../../core/services/product';

@Component({
    selector: 'app-product-details',
    imports: [RouterLink],
    templateUrl: './product-details.html',
    styleUrl: './product-details.css'
})
export class ProductDetails implements OnInit, OnDestroy {
    product: IProduct | null = null;
    isLoading = true;
    isAddingToCart = false;
    errorMessage = '';
    cartMessage = '';
    staticURL = env.staticURL;
    private subscriptions = new Subscription();

    constructor(private _activatedRoute: ActivatedRoute, private _productService: ProductService, private _cartService: CartService, private _guestCartService: GuestCartService, private _authService: AuthService, private _cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        const slug = this._activatedRoute.snapshot.paramMap.get('slug');

        if (!slug) {
            this.isLoading = false;
            this.errorMessage = 'Product not found';
            return;
        }

        const productSubscription = this._productService.getProductBySlug(slug).subscribe({
            next: res => {
                this.product = res;
                this.isLoading = false;
                this._cdr.detectChanges();
            },
            error: err => {
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Failed to load product';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(productSubscription);
    }

    addToCart() {
        if (!this.product) {
            return;
        }

        this.cartMessage = '';
        this.errorMessage = '';

        if (!this._authService.isUser()) {
            const added = this._guestCartService.addToCart(this.product);

            if (!added) {
                this.errorMessage = 'The requested quantity exceeds the available stock';
            } else {
                this.cartMessage = 'Product added to guest cart successfully';
            }

            this._cdr.detectChanges();
            return;
        }

        this.isAddingToCart = true;

        const cartSubscription = this._cartService.addToCart(this.product._id).subscribe({
            next: () => {
                this.isAddingToCart = false;
                this.cartMessage = 'Product added to cart successfully';
                this._cdr.detectChanges();
            },
            error: err => {
                this.isAddingToCart = false;
                this.errorMessage = err.error?.message || 'Failed to add product to cart';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(cartSubscription);
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}