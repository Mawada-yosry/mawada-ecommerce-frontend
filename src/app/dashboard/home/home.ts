import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { OrderService } from '../../core/services/order';
import { ProductService } from '../../core/services/product';
import { TestimonialService } from '../../core/services/testimonial';

@Component({
    selector: 'app-dashboard-home',
    imports: [RouterLink],
    templateUrl: './home.html',
    styleUrl: './home.css'
})
export class Home implements OnInit, OnDestroy {
    pendingOrdersCount = 0;
    outOfStockProductsCount = 0;
    lowStockProductsCount = 0;
    pendingTestimonialsCount = 0;
    isLoadingOrders = true;
    isLoadingProducts = true;
    isLoadingTestimonials = true;
    errorMessage = '';
    private subscriptions = new Subscription();
    constructor(private _orderService: OrderService, private _productService: ProductService, private _testimonialService: TestimonialService, private _cdr: ChangeDetectorRef) {}
    ngOnInit(): void {
        this.getPendingOrders();
        this.getProductStockNotifications();
        this.getPendingTestimonials();
    }
    getPendingOrders() {
        const ordersSubscription = this._orderService.getAllOrdersForAdmin('Pending').subscribe({
            next: res => {
                this.pendingOrdersCount = res.length;
                this.isLoadingOrders = false;
                this._cdr.detectChanges();
            },
            error: err => {
                this.isLoadingOrders = false;
                this.errorMessage = err.error?.message || 'Failed to load pending orders';
                this._cdr.detectChanges();
            }
        });
        this.subscriptions.add(ordersSubscription);
    }
    getProductStockNotifications() {
        const productsSubscription = this._productService.getAllProductsForAdmin().subscribe({
            next: res => {
                this.outOfStockProductsCount = res.filter(product => product.stockQuantity === 0).length;
                this.lowStockProductsCount = res.filter(product => product.stockQuantity > 0 && product.stockQuantity < 5).length;
                this.isLoadingProducts = false;
                this._cdr.detectChanges();
            },
            error: err => {
                this.isLoadingProducts = false;
                this.errorMessage = err.error?.message || 'Failed to load product stock';
                this._cdr.detectChanges();
            }
        });
        this.subscriptions.add(productsSubscription);
    }
    getPendingTestimonials() {
        const testimonialsSubscription = this._testimonialService.getAllTestimonialsForAdmin('Pending').subscribe({
            next: res => {
                this.pendingTestimonialsCount = res.length;
                this.isLoadingTestimonials = false;
                this._cdr.detectChanges();
            },
            error: err => {
                this.isLoadingTestimonials = false;
                this.errorMessage = err.error?.message || 'Failed to load pending testimonials';
                this._cdr.detectChanges();
            }
        });
        this.subscriptions.add(testimonialsSubscription);
    }
    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}