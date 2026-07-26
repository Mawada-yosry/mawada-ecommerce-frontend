import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IDynamicPage, IDynamicPageData } from '../../core/models/dynamic-page.model';
import { DynamicPageService } from '../../core/services/dynamic-page';

@Component({
    selector: 'app-dashboard-pages',
    imports: [ReactiveFormsModule],
    templateUrl: './pages.html',
    styleUrl: './pages.css'
})
export class Pages implements OnInit, OnDestroy {
    pagesList: IDynamicPage[] = [];
    selectedPageId = '';
    isLoading = true;
    isSaving = false;
    updatingPageId = '';
    deletingPageId = '';
    errorMessage = '';
    successMessage = '';
    private subscriptions = new Subscription();

    pageForm = new FormGroup({
        pageKey: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        content: new FormControl('', { nonNullable: true, validators: [Validators.required] })
    });

    constructor(private _dynamicPageService: DynamicPageService, private _cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.getPages();
    }

    getPages() {
        this.isLoading = true;
        this.errorMessage = '';

        const pagesSubscription = this._dynamicPageService.getAllPagesForAdmin().subscribe({
            next: res => {
                this.pagesList = res;
                this.isLoading = false;
                this._cdr.detectChanges();
            },
            error: err => {
                this.pagesList = [];
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Failed to load pages';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(pagesSubscription);
    }

    savePage() {
        if (this.pageForm.invalid) {
            this.pageForm.markAllAsTouched();
            return;
        }

        const pageData: IDynamicPageData = {
            pageKey: this.pageForm.controls.pageKey.value.trim(),
            title: this.pageForm.controls.title.value.trim(),
            content: this.pageForm.controls.content.value.trim()
        };

        this.isSaving = true;
        this.errorMessage = '';
        this.successMessage = '';

        if (this.selectedPageId) {
            this.updatePage(pageData);
        } else {
            this.createPage(pageData);
        }
    }

    createPage(data: IDynamicPageData) {
        const pageSubscription = this._dynamicPageService.createPage(data).subscribe({
            next: res => {
                this.pagesList.unshift(res);
                this.isSaving = false;
                this.successMessage = 'Page created successfully';
                this.resetForm();
                this._cdr.detectChanges();
            },
            error: err => {
                this.isSaving = false;
                this.errorMessage = err.error?.message || 'Failed to create page';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(pageSubscription);
    }

    updatePage(data: IDynamicPageData) {
        const pageId = this.selectedPageId;

        const pageSubscription = this._dynamicPageService.updatePage(pageId, data).subscribe({
            next: res => {
                const pageIndex = this.pagesList.findIndex(page => page._id === pageId);

                if (pageIndex !== -1) {
                    this.pagesList[pageIndex] = res;
                }

                this.isSaving = false;
                this.successMessage = 'Page updated successfully';
                this.resetForm();
                this._cdr.detectChanges();
            },
            error: err => {
                this.isSaving = false;
                this.errorMessage = err.error?.message || 'Failed to update page';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(pageSubscription);
    }

    editPage(page: IDynamicPage) {
        this.selectedPageId = page._id;
        this.errorMessage = '';
        this.successMessage = '';

        this.pageForm.patchValue({
            pageKey: page.pageKey,
            title: page.title,
            content: page.content
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    resetForm() {
        this.selectedPageId = '';
        this.pageForm.reset({
            pageKey: '',
            title: '',
            content: ''
        });
    }

    updateStatus(page: IDynamicPage) {
        this.updatingPageId = page._id;
        this.errorMessage = '';
        this.successMessage = '';

        const pageSubscription = this._dynamicPageService.updatePageStatus(page._id, !page.isActive).subscribe({
            next: res => {
                const pageIndex = this.pagesList.findIndex(item => item._id === page._id);

                if (pageIndex !== -1) {
                    this.pagesList[pageIndex] = res.data;
                }

                this.updatingPageId = '';
                this.successMessage = res.message;
                this._cdr.detectChanges();
            },
            error: err => {
                this.updatingPageId = '';
                this.errorMessage = err.error?.message || 'Failed to update page status';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(pageSubscription);
    }

    deletePage(page: IDynamicPage) {
        const confirmed = confirm('Are you sure you want to delete this page?');

        if (!confirmed) {
            return;
        }

        this.deletingPageId = page._id;
        this.errorMessage = '';
        this.successMessage = '';

        const pageSubscription = this._dynamicPageService.deletePage(page._id).subscribe({
            next: res => {
                this.pagesList = this.pagesList.filter(item => item._id !== page._id);
                this.deletingPageId = '';
                this.successMessage = res.message;

                if (this.selectedPageId === page._id) {
                    this.resetForm();
                }

                this._cdr.detectChanges();
            },
            error: err => {
                this.deletingPageId = '';
                this.errorMessage = err.error?.message || 'Failed to delete page';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(pageSubscription);
    }

    openPage(pageKey: string) {
        window.open('/pages/' + pageKey, '_blank');
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}