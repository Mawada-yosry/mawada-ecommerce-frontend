import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ICategory, ICategoryData } from '../../core/models/category.model';
import { CategoryService } from '../../core/services/category';

@Component({
    selector: 'app-dashboard-categories',
    imports: [ReactiveFormsModule],
    templateUrl: './categories.html',
    styleUrl: './categories.css'
})
export class Categories implements OnInit, OnDestroy {
    categoriesList: ICategory[] = [];
    selectedCategoryId = '';
    isLoading = true;
    isSaving = false;
    updatingCategoryId = '';
    deletingCategoryId = '';
    errorMessage = '';
    successMessage = '';
    private subscriptions = new Subscription();
    categoryForm = new FormGroup({
        name: new FormControl('', { nonNullable: true, validators: [Validators.required] })
    });
    constructor(private _categoryService: CategoryService, private _cdr: ChangeDetectorRef) {}
    ngOnInit(): void {
        this.getCategories();
    }
    getCategories() {
        this.isLoading = true;
        this.errorMessage = '';
        const categorySubscription = this._categoryService.getAllCategoriesForAdmin().subscribe({
            next: res => {
                this.categoriesList = res;
                this.isLoading = false;
                this._cdr.detectChanges();
            },
            error: err => {
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Failed to load categories';
                this._cdr.detectChanges();
            }
        });
        this.subscriptions.add(categorySubscription);
    }
    saveCategory() {
        if (this.categoryForm.invalid) {
            this.categoryForm.markAllAsTouched();
            return;
        }
        const categoryData: ICategoryData = {
            name: this.categoryForm.controls.name.value.trim()
        };
        this.isSaving = true;
        this.errorMessage = '';
        this.successMessage = '';
        if (this.selectedCategoryId) {
            this.updateCategory(categoryData);
        } else {
            this.createCategory(categoryData);
        }
    }
    createCategory(data: ICategoryData) {
        const categorySubscription = this._categoryService.createCategory(data).subscribe({
            next: res => {
                this.categoriesList.unshift(res);
                this.isSaving = false;
                this.successMessage = 'Category created successfully';
                this.resetForm();
                this._cdr.detectChanges();
            },
            error: err => {
                this.isSaving = false;
                this.errorMessage = err.error?.message || 'Failed to create category';
                this._cdr.detectChanges();
            }
        });
        this.subscriptions.add(categorySubscription);
    }
    updateCategory(data: ICategoryData) {
        const categorySubscription = this._categoryService.updateCategory(this.selectedCategoryId, data).subscribe({
            next: res => {
                const categoryIndex = this.categoriesList.findIndex(category => category._id === this.selectedCategoryId);
                if (categoryIndex !== -1) {
                    this.categoriesList[categoryIndex] = res;
                }
                this.isSaving = false;
                this.successMessage = 'Category updated successfully';
                this.resetForm();
                this._cdr.detectChanges();
            },
            error: err => {
                this.isSaving = false;
                this.errorMessage = err.error?.message || 'Failed to update category';
                this._cdr.detectChanges();
            }
        });
        this.subscriptions.add(categorySubscription);
    }
    editCategory(category: ICategory) {
        this.selectedCategoryId = category._id;
        this.errorMessage = '';
        this.successMessage = '';
        this.categoryForm.patchValue({ name: category.name });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    resetForm() {
        this.selectedCategoryId = '';
        this.categoryForm.reset({ name: '' });
    }
    updateStatus(category: ICategory) {
        this.updatingCategoryId = category._id;
        this.errorMessage = '';
        this.successMessage = '';
        const categorySubscription = this._categoryService.updateCategoryStatus(category._id, !category.isActive).subscribe({
           next: res => {
                const categoryIndex = this.categoriesList.findIndex(item => item._id === category._id);
                if (categoryIndex !== -1) {
                    this.categoriesList[categoryIndex] = res.data;
                }
                this.updatingCategoryId = '';
                this.successMessage = res.message;
                this._cdr.detectChanges();
            },
            error: err => {
                this.updatingCategoryId = '';
                this.errorMessage = err.error?.message || 'Failed to update category status';
                this._cdr.detectChanges();
            }
        });
        this.subscriptions.add(categorySubscription);
    }
    deleteCategory(category: ICategory) {
        const confirmed = confirm('Are you sure you want to delete this category?');
        if (!confirmed) {
            return;
        }
        this.deletingCategoryId = category._id;
        this.errorMessage = '';
        this.successMessage = '';
        const categorySubscription = this._categoryService.deleteCategory(category._id).subscribe({
            next: res => {
                this.categoriesList = this.categoriesList.filter(item => item._id !== category._id);
                this.deletingCategoryId = '';
                this.successMessage = res.message;
                if (this.selectedCategoryId === category._id) {
                    this.resetForm();
                }
                this._cdr.detectChanges();
            },
            error: err => {
                this.deletingCategoryId = '';
                this.errorMessage = err.error?.message || 'Failed to delete category';
                this._cdr.detectChanges();
            }
        });
        this.subscriptions.add(categorySubscription);
    }
    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}