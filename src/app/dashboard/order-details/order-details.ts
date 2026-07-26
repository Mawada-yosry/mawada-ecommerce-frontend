import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { env } from '../../../env/env';
import { IOrder, OrderStatus } from '../../core/models/order.model';
import { OrderService } from '../../core/services/order';

@Component({
    selector: 'app-dashboard-order-details',
    imports: [RouterLink, DatePipe],
    templateUrl: './order-details.html',
    styleUrl: './order-details.css'
})
export class OrderDetails implements OnInit, OnDestroy {
    order: IOrder | null = null;
    isLoading = true;
    isUpdating = false;
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

        this.getOrder(orderId);
    }

    getOrder(id: string) {
        const orderSubscription = this._orderService.getOrderByIdForAdmin(id).subscribe({
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

    updateStatus(value: string) {
        if (!this.order) {
            return;
        }

        const orderStatus = value as OrderStatus;

        if (!this.getNextStatuses(this.order.orderStatus).includes(orderStatus)) {
            this.errorMessage = 'Select a valid next status';
            return;
        }

        if (orderStatus === 'Rejected' || orderStatus === 'CancelledByAdmin') {
            const confirmed = confirm('Are you sure you want to change the order to this status?');

            if (!confirmed) {
                return;
            }
        }

        this.isUpdating = true;
        this.errorMessage = '';
        this.successMessage = '';

        const orderSubscription = this._orderService.updateOrderStatus(this.order._id, orderStatus).subscribe({
            next: res => {
                if (this.order) {
                    this.order.orderStatus = res.order.orderStatus;
                    this.order.stockReturned = res.order.stockReturned;
                }

                this.isUpdating = false;
                this.successMessage = res.message;
                this._cdr.detectChanges();
            },
            error: err => {
                this.isUpdating = false;
                this.errorMessage = err.error?.message || 'Failed to update order status';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(orderSubscription);
    }

   getNextStatuses(status: OrderStatus | string | undefined): OrderStatus[] {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
        Pending: ['Prepared', 'Rejected', 'CancelledByAdmin'],
        Prepared: ['Shipped', 'Rejected', 'CancelledByAdmin'],
        Shipped: ['Received'],
        Received: [],
        Rejected: [],
        CancelledByUser: [],
        CancelledByAdmin: []
    };
    if (!status || !(status in transitions)) {
        return [];
    }
    return transitions[status as OrderStatus];
}
    getCustomerName() {
        return !this.order || typeof this.order.user === 'string' ? 'Unknown Customer' : this.order.user.name;
    }
    getCustomerEmail() {
        return !this.order || typeof this.order.user === 'string' ? '' : this.order.user.email;
    }
    getCustomerPhone() {
        return !this.order || typeof this.order.user === 'string' ? this.order?.shippingPhone || '' : this.order.user.phone;
    }
    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}