import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ICreateOrderData } from '../../core/models/order.model';
import { AuthService } from '../../core/services/auth';
import { OrderService } from '../../core/services/order';

@Component({
    selector: 'app-checkout',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './checkout.html',
    styleUrl: './checkout.css'
})
export class Checkout implements OnInit, OnDestroy {
    isLoading = true;
    isCreatingOrder = false;
    errorMessage = '';
    successMessage = '';
    createdOrderId = '';
    private subscriptions = new Subscription();

    checkoutForm = new FormGroup({
        shippingAddress: new FormControl('', [Validators.required]),
        shippingPhone: new FormControl('', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)])
    });

    constructor(private _authService: AuthService, private _orderService: OrderService, private _cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        const profileSubscription = this._authService.getProfile().subscribe({
            next: res => {
                this.checkoutForm.patchValue({
                    shippingAddress: res.data.address,
                    shippingPhone: res.data.phone
                });

                this.isLoading = false;
                this._cdr.detectChanges();
            },
            error: err => {
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Failed to load profile';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(profileSubscription);
    }

    createOrder() {
        if (this.checkoutForm.invalid) {
            this.checkoutForm.markAllAsTouched();
            return;
        }

        const orderData: ICreateOrderData = {
            shippingAddress: this.checkoutForm.value.shippingAddress!.trim(),
            shippingPhone: this.checkoutForm.value.shippingPhone!.trim(),
            paymentMethod: 'Cash'
        };

        this.isCreatingOrder = true;
        this.errorMessage = '';
        this.successMessage = '';

        const orderSubscription = this._orderService.createOrder(orderData).subscribe({
            next: res => {
                this.isCreatingOrder = false;
                this.createdOrderId = res._id;
                this.successMessage = 'Order created successfully';
                this._cdr.detectChanges();
            },
            error: err => {
                this.isCreatingOrder = false;
                this.errorMessage = err.error?.message || 'Failed to create order';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(orderSubscription);
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}