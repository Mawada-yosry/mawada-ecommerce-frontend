import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IChangePasswordData, IUpdateProfileData } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth';

@Component({
    selector: 'app-profile',
    imports: [ReactiveFormsModule],
    templateUrl: './profile.html',
    styleUrl: './profile.css'
})
export class Profile implements OnInit, OnDestroy {
    isLoading = true;
    isUpdatingProfile = false;
    isChangingPassword = false;
    profileErrorMessage = '';
    profileSuccessMessage = '';
    passwordErrorMessage = '';
    passwordSuccessMessage = '';
    userEmail = '';
    userRole = '';
    private subscriptions = new Subscription();

    profileForm = new FormGroup({
        name: new FormControl('', [Validators.required]),
        phone: new FormControl('', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]),
        address: new FormControl('', [Validators.required])
    });

    passwordForm = new FormGroup({
        currentPassword: new FormControl('', [Validators.required]),
        newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
        confirmPassword: new FormControl('', [Validators.required])
    });

    constructor(private _authService: AuthService, private _cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.getProfile();
    }

    getProfile() {
        const profileSubscription = this._authService.getProfile().subscribe({
            next: res => {
                this.profileForm.patchValue({
                    name: res.data.name,
                    phone: res.data.phone,
                    address: res.data.address
                });

                this.userEmail = res.data.email;
                this.userRole = res.data.role;
                this.isLoading = false;
                this._cdr.detectChanges();
            },
            error: err => {
                this.isLoading = false;
                this.profileErrorMessage = err.error?.message || 'Failed to load profile';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(profileSubscription);
    }

    updateProfile() {
        if (this.profileForm.invalid) {
            this.profileForm.markAllAsTouched();
            return;
        }

        const profileData: IUpdateProfileData = {
            name: this.profileForm.value.name!.trim(),
            phone: this.profileForm.value.phone!.trim(),
            address: this.profileForm.value.address!.trim()
        };

        this.isUpdatingProfile = true;
        this.profileErrorMessage = '';
        this.profileSuccessMessage = '';

        const profileSubscription = this._authService.updateProfile(profileData).subscribe({
            next: res => {
                this.isUpdatingProfile = false;
                this.profileSuccessMessage = res.message;
                this._cdr.detectChanges();
            },
            error: err => {
                this.isUpdatingProfile = false;
                this.profileErrorMessage = err.error?.message || 'Failed to update profile';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(profileSubscription);
    }

    changePassword() {
        if (this.passwordForm.invalid) {
            this.passwordForm.markAllAsTouched();
            return;
        }

        const currentPassword = this.passwordForm.value.currentPassword!;
        const newPassword = this.passwordForm.value.newPassword!;
        const confirmPassword = this.passwordForm.value.confirmPassword!;

        if (newPassword !== confirmPassword) {
            this.passwordErrorMessage = 'Passwords do not match';
            return;
        }

        const passwordData: IChangePasswordData = {
            currentPassword,
            newPassword
        };

        this.isChangingPassword = true;
        this.passwordErrorMessage = '';
        this.passwordSuccessMessage = '';

        const passwordSubscription = this._authService.changePassword(passwordData).subscribe({
            next: res => {
                this.isChangingPassword = false;
                this.passwordSuccessMessage = res.message;
                this.passwordForm.reset();
                this._cdr.detectChanges();
            },
            error: err => {
                this.isChangingPassword = false;
                this.passwordErrorMessage = err.error?.message || 'Failed to change password';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(passwordSubscription);
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}