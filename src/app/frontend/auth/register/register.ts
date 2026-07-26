import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { IRegisterData } from '../../../core/models/user.model';

@Component({
    selector: 'app-register',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './register.html',
    styleUrl: './register.css'
})
export class Register {
    isLoading = false;
    errorMessage = '';

    registerForm = new FormGroup({
        name: new FormControl(''),
        email: new FormControl(''),
        phone: new FormControl(''),
        address: new FormControl(''),
        password: new FormControl('')
    });

    constructor(private _authService: AuthService, private _router: Router) {}

    register() {
        this.isLoading = true;
        this.errorMessage = '';

        this._authService.register(this.registerForm.value as IRegisterData).subscribe({
            next: () => {
                this.isLoading = false;
                this._router.navigate(['/login']);
            },
            error: err => {
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Registration failed';
            }
        });
    }
}