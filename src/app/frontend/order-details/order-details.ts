import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { env } from '../../../env/env';
import { IOrder } from '../../core/models/order.model';
import { OrderService } from '../../core/services/order';

@Component({
    selector: 'app-order-details',
    imports: [RouterLink, DatePipe],
    templateUrl: './order-details.html',
    styleUrl: './order-details.css'
})
export class OrderDetails implements OnInit, OnDestroy {
    order: IOrder | null = null;
    isLoading = true;
    isCancelling = false;
    errorMessage = '';
    successMessage = '';
    staticURL = env.staticURL;
    private subscriptions = new Subscription();

    constructor(private _activatedRoute: ActivatedRoute, private _orderService: OrderService, private _cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        const orderId = this._activatedRoute.snapshot.paramMap.get('id');

        if (!orderId) {
            this.isLoading = false;
            this.errorMessage = 'Order not found';
            return;
        }

        const orderSubscription = this._orderService.getOrderById(orderId).subscribe({
            next: res => {
                this.order = res;
                this.isLoading = false;
                this._cdr.detectChanges();
            },
            error: err => {
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Failed to load order';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(orderSubscription);
    }

    cancelOrder() {
        if (!this.order) {
            return;
        }

        this.isCancelling = true;
        this.errorMessage = '';
        this.successMessage = '';

        const cancelSubscription = this._orderService.cancelOrder(this.order._id).subscribe({
            next: res => {
                this.order = res.order;
                this.isCancelling = false;
                this.successMessage = res.message;
                this._cdr.detectChanges();
            },
            error: err => {
                this.isCancelling = false;
                this.errorMessage = err.error?.message || 'Failed to cancel order';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(cancelSubscription);
    }

    canCancelOrder() {
        return this.order?.orderStatus === 'Pending' || this.order?.orderStatus === 'Prepared';
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}