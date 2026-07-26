import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { IOrder, OrderStatus } from '../../core/models/order.model';
import { OrderService } from '../../core/services/order';

@Component({
    selector: 'app-dashboard-orders',
    imports: [ReactiveFormsModule, RouterLink, DatePipe],
    templateUrl: './orders.html',
    styleUrl: './orders.css'
})
export class Orders implements OnInit, OnDestroy {
    ordersList: IOrder[] = [];
    filteredOrdersList: IOrder[] = [];
    isLoading = true;
    updatingOrderId = '';
    errorMessage = '';
    successMessage = '';
    private subscriptions = new Subscription();

    orderStatuses: OrderStatus[] = ['Pending', 'Prepared', 'Shipped', 'Received', 'Rejected', 'CancelledByUser', 'CancelledByAdmin'];

    filterForm = new FormGroup({
        keyword: new FormControl('', { nonNullable: true }),
        status: new FormControl<OrderStatus | ''>('', { nonNullable: true })
    });

    constructor(private _orderService: OrderService, private _cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.getOrders();
    }

    getOrders() {
        const status = this.filterForm.controls.status.value;

        this.isLoading = true;
        this.errorMessage = '';

        const ordersSubscription = this._orderService.getAllOrdersForAdmin(status).subscribe({
            next: res => {
                this.ordersList = res;
                this.applySearch();
                this.isLoading = false;
                this._cdr.detectChanges();
            },
            error: err => {
                this.ordersList = [];
                this.filteredOrdersList = [];
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Failed to load orders';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(ordersSubscription);
    }

    applySearch() {
        const keyword = this.filterForm.controls.keyword.value.trim().toLowerCase();

        if (!keyword) {
            this.filteredOrdersList = [...this.ordersList];
            return;
        }

        this.filteredOrdersList = this.ordersList.filter(order => {
            const customerName = this.getCustomerName(order).toLowerCase();
            const customerEmail = this.getCustomerEmail(order).toLowerCase();
            const customerPhone = this.getCustomerPhone(order).toLowerCase();

            return order._id.toLowerCase().includes(keyword) || customerName.includes(keyword) || customerEmail.includes(keyword) || customerPhone.includes(keyword);
        });
    }

    searchOrders() {
        this.getOrders();
    }

    clearFilters() {
        this.filterForm.setValue({
            keyword: '',
            status: ''
        });

        this.getOrders();
    }

    updateStatus(order: IOrder, value: string) {
        const orderStatus = value as OrderStatus;
        const nextStatuses = this.getNextStatuses(order.orderStatus);

        if (!nextStatuses.includes(orderStatus)) {
            this.errorMessage = 'Select a valid next status';
            return;
        }

        if (orderStatus === 'Rejected' || orderStatus === 'CancelledByAdmin') {
            const confirmed = confirm('Are you sure you want to change the order to this status?');

            if (!confirmed) {
                return;
            }
        }

        this.updatingOrderId = order._id;
        this.errorMessage = '';
        this.successMessage = '';

        const orderSubscription = this._orderService.updateOrderStatus(order._id, orderStatus).subscribe({
            next: res => {
                order.orderStatus = res.order.orderStatus;
                order.stockReturned = res.order.stockReturned;
                this.updatingOrderId = '';
                this.successMessage = res.message;
                this.applySearch();
                this._cdr.detectChanges();
            },
            error: err => {
                this.updatingOrderId = '';
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

    getCustomerName(order: IOrder) {
        return typeof order.user === 'string' ? 'Unknown Customer' : order.user.name;
    }

    getCustomerEmail(order: IOrder) {
        return typeof order.user === 'string' ? '' : order.user.email;
    }

    getCustomerPhone(order: IOrder) {
        return typeof order.user === 'string' ? order.shippingPhone : order.user.phone;
    }

   getItemsCount(order: IOrder) {
    if (!Array.isArray(order.items)) {
        return 0;
    }

    return order.items.reduce((total, item) => total + item.quantity, 0);
}

  getStatusClass(status: OrderStatus | string | undefined) {
    if (status === 'Received') {
        return 'received-status';
    }

    if (status === 'Rejected' || status === 'CancelledByUser' || status === 'CancelledByAdmin') {
        return 'cancelled-status';
    }

    if (status === 'Shipped') {
        return 'shipped-status';
    }

    return 'pending-status';
}
    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}