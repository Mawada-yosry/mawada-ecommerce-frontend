import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { GuestCartService } from '../../../core/services/guest-cart';

@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule],
    templateUrl: './login.html',
    styleUrl: './login.css'
})
export class Login {
    private _formBuilder = inject(FormBuilder);
    private _authService = inject(AuthService);
    private _guestCartService = inject(GuestCartService);

    isLoading = false;
    errorMessage = '';

    loginForm = this._formBuilder.group({
        identifier: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]]
    });

    login() {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        const identifier = this.loginForm.value.identifier!.trim();
        const password = this.loginForm.value.password!;
        const loginData = identifier.includes('@') ? { email: identifier, password } : { phone: identifier, password };

        this.isLoading = true;
        this.errorMessage = '';

        this._authService.login(loginData).subscribe({
           next: () => {
    if (this._authService.isUser()) {
        this._guestCartService.mergeGuestCart().subscribe({
            next: () => {
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            }
        });
    } else {
        this.isLoading = false;
    }
},
            error: err => {
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Login failed';
            }
        });
    }
}