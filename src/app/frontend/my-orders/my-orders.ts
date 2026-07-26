import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { IOrder } from '../../core/models/order.model';
import { OrderService } from '../../core/services/order';

@Component({
    selector: 'app-my-orders',
    imports: [RouterLink, DatePipe],
    templateUrl: './my-orders.html',
    styleUrl: './my-orders.css'
})
export class MyOrders implements OnInit, OnDestroy {
    ordersList: IOrder[] = [];
    isLoading = true;
    errorMessage = '';
    successMessage = '';
    private subscriptions = new Subscription();

    constructor(private _orderService: OrderService, private _cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.getOrders();
    }

    getOrders() {
        this.isLoading = true;
        this.errorMessage = '';

        const ordersSubscription = this._orderService.getMyOrders().subscribe({
            next: res => {
                this.ordersList = res;
                this.isLoading = false;
                this._cdr.detectChanges();
            },
            error: err => {
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Failed to load orders';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(ordersSubscription);
    }

    cancelOrder(id: string) {
        this.errorMessage = '';
        this.successMessage = '';

        const cancelSubscription = this._orderService.cancelOrder(id).subscribe({
            next: res => {
                const orderIndex = this.ordersList.findIndex(order => order._id === id);

                if (orderIndex !== -1) {
                    this.ordersList[orderIndex] = res.order;
                }

                this.successMessage = res.message;
                this._cdr.detectChanges();
            },
            error: err => {
                this.errorMessage = err.error?.message || 'Failed to cancel order';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(cancelSubscription);
    }

    canCancelOrder(order: IOrder) {
        return order.orderStatus === 'Pending' || order.orderStatus === 'Prepared';
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}