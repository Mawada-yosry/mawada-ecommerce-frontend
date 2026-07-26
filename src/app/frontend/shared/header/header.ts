import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth';

@Component({
    selector: 'app-frontend-header',
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './header.html',
    styleUrl: './header.css'
})
export class Header implements OnInit, OnDestroy {
    name: string | null = null;
    private subscriptions = new Subscription();

    constructor(private _authService: AuthService, private _cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        const authSubscription = this._authService.isLoggedIn().subscribe(data => {
            setTimeout(() => {
                this.name = data;
                this._cdr.detectChanges();
            });
        });

        this.subscriptions.add(authSubscription);
    }

    logout() {
        this._authService.logout();
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}