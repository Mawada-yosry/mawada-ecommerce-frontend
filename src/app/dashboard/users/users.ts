import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { IUser } from '../../core/models/user.model';
import { UserService } from '../../core/services/user';

@Component({
    selector: 'app-dashboard-users',
    imports: [],
    templateUrl: './users.html',
    styleUrl: './users.css'
})
export class Users implements OnInit, OnDestroy {
    usersList: IUser[] = [];
    isLoading = true;
    updatingUserId = '';
    deletingUserId = '';
    errorMessage = '';
    successMessage = '';
    private subscriptions = new Subscription();

    constructor(private _userService: UserService, private _cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.getUsers();
    }

    getUsers() {
        this.isLoading = true;
        this.errorMessage = '';

        const usersSubscription = this._userService.getUsers().subscribe({
            next: res => {
                this.usersList = res.data;
                this.isLoading = false;
                this._cdr.detectChanges();
            },
            error: err => {
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Failed to load users';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(usersSubscription);
    }

    updateStatus(user: IUser) {
        this.updatingUserId = user._id;
        this.errorMessage = '';
        this.successMessage = '';

        const statusSubscription = this._userService.updateUserStatus(user._id, !user.isActive).subscribe({
            next: res => {
                const userIndex = this.usersList.findIndex(item => item._id === user._id);

                if (userIndex !== -1) {
                    this.usersList[userIndex] = res.data;
                }

                this.updatingUserId = '';
                this.successMessage = res.message;
                this._cdr.detectChanges();
            },
            error: err => {
                this.updatingUserId = '';
                this.errorMessage = err.error?.message || 'Failed to update user status';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(statusSubscription);
    }

    deleteUser(user: IUser) {
        const confirmed = confirm('Are you sure you want to delete this user?');

        if (!confirmed) {
            return;
        }

        this.deletingUserId = user._id;
        this.errorMessage = '';
        this.successMessage = '';

        const deleteSubscription = this._userService.deleteUser(user._id).subscribe({
            next: res => {
                this.usersList = this.usersList.filter(item => item._id !== user._id);
                this.deletingUserId = '';
                this.successMessage = res.message;
                this._cdr.detectChanges();
            },
            error: err => {
                this.deletingUserId = '';
                this.errorMessage = err.error?.message || 'Failed to delete user';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(deleteSubscription);
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}