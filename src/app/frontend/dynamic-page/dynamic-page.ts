import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { IDynamicPage } from '../../core/models/dynamic-page.model';
import { DynamicPageService } from '../../core/services/dynamic-page';

@Component({
    selector: 'app-dynamic-page',
    imports: [RouterLink],
    templateUrl: './dynamic-page.html',
    styleUrl: './dynamic-page.css'
})
export class DynamicPage implements OnInit, OnDestroy {
    page: IDynamicPage | null = null;
    isLoading = true;
    errorMessage = '';
    private subscriptions = new Subscription();

    constructor(private _activatedRoute: ActivatedRoute, private _dynamicPageService: DynamicPageService, private _cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        const routeSubscription = this._activatedRoute.paramMap.subscribe(params => {
            const pageKey = params.get('pageKey');

            if (!pageKey) {
                this.isLoading = false;
                this.errorMessage = 'Page not found';
                return;
            }

            this.getPage(pageKey);
        });

        this.subscriptions.add(routeSubscription);
    }

    getPage(pageKey: string) {
        this.isLoading = true;
        this.errorMessage = '';
        this.page = null;

        const pageSubscription = this._dynamicPageService.getPageByKey(pageKey).subscribe({
            next: res => {
                this.page = res;
                this.isLoading = false;
                this._cdr.detectChanges();
            },
            error: err => {
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Failed to load page';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(pageSubscription);
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}