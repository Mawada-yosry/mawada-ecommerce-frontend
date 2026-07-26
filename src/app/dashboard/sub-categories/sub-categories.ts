import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ICategory, ISubCategory, ISubCategoryData } from '../../core/models/category.model';
import { CategoryService } from '../../core/services/category';

@Component({
    selector: 'app-sub-categories',
    imports: [ReactiveFormsModule],
    templateUrl: './sub-categories.html',
    styleUrl: './sub-categories.css'
})
export class SubCategories implements OnInit, OnDestroy {
    categoriesList: ICategory[] = [];
    subCategoriesList: ISubCategory[] = [];
    selectedSubCategoryId = '';
    isLoading = true;
    isSaving = false;
    updatingSubCategoryId = '';
    deletingSubCategoryId = '';
    errorMessage = '';
    successMessage = '';
    private subscriptions = new Subscription();

    subCategoryForm = new FormGroup({
        name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        category: new FormControl('', { nonNullable: true, validators: [Validators.required] })
    });

    constructor(private _categoryService: CategoryService, private _cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.getCategories();
        this.getSubCategories();
    }

    getCategories() {
        const categorySubscription = this._categoryService.getAllCategoriesForAdmin().subscribe({
            next: res => {
                this.categoriesList = res;
                this._cdr.detectChanges();
            },
            error: err => {
                this.errorMessage = err.error?.message || 'Failed to load categories';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(categorySubscription);
    }

    getSubCategories() {
        this.isLoading = true;
        this.errorMessage = '';

        const subCategorySubscription = this._categoryService.getAllSubCategoriesForAdmin().subscribe({
            next: res => {
                this.subCategoriesList = res;
                this.isLoading = false;
                this._cdr.detectChanges();
            },
            error: err => {
                this.subCategoriesList = [];
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Failed to load subcategories';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(subCategorySubscription);
    }

    saveSubCategory() {
        if (this.subCategoryForm.invalid) {
            this.subCategoryForm.markAllAsTouched();
            return;
        }

        const subCategoryData: ISubCategoryData = {
            name: this.subCategoryForm.controls.name.value.trim(),
            category: this.subCategoryForm.controls.category.value
        };

        this.isSaving = true;
        this.errorMessage = '';
        this.successMessage = '';

        if (this.selectedSubCategoryId) {
            this.updateSubCategory(subCategoryData);
        } else {
            this.createSubCategory(subCategoryData);
        }
    }

    createSubCategory(data: ISubCategoryData) {
        const subCategorySubscription = this._categoryService.createSubCategory(data).subscribe({
            next: () => {
                this.isSaving = false;
                this.successMessage = 'SubCategory created successfully';
                this.resetForm();
                this.getSubCategories();
            },
            error: err => {
                this.isSaving = false;
                this.errorMessage = err.error?.message || 'Failed to create subcategory';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(subCategorySubscription);
    }

    updateSubCategory(data: ISubCategoryData) {
        const subCategorySubscription = this._categoryService.updateSubCategory(this.selectedSubCategoryId, data).subscribe({
            next: () => {
                this.isSaving = false;
                this.successMessage = 'SubCategory updated successfully';
                this.resetForm();
                this.getSubCategories();
            },
            error: err => {
                this.isSaving = false;
                this.errorMessage = err.error?.message || 'Failed to update subcategory';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(subCategorySubscription);
    }

    editSubCategory(subCategory: ISubCategory) {
        this.selectedSubCategoryId = subCategory._id;
        this.errorMessage = '';
        this.successMessage = '';

        this.subCategoryForm.patchValue({
            name: subCategory.name,
            category: this.getCategoryId(subCategory)
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    resetForm() {
        this.selectedSubCategoryId = '';
        this.subCategoryForm.reset({
            name: '',
            category: ''
        });
    }

    updateStatus(subCategory: ISubCategory) {
        this.updatingSubCategoryId = subCategory._id;
        this.errorMessage = '';
        this.successMessage = '';

        const statusSubscription = this._categoryService.updateSubCategoryStatus(subCategory._id, !subCategory.isActive).subscribe({
            next: res => {
                subCategory.isActive = res.data.isActive;
                this.updatingSubCategoryId = '';
                this.successMessage = res.message;
                this._cdr.detectChanges();
            },
            error: err => {
                this.updatingSubCategoryId = '';
                this.errorMessage = err.error?.message || 'Failed to update subcategory status';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(statusSubscription);
    }

    deleteSubCategory(subCategory: ISubCategory) {
        const confirmed = confirm('Are you sure you want to delete this subcategory?');

        if (!confirmed) {
            return;
        }

        this.deletingSubCategoryId = subCategory._id;
        this.errorMessage = '';
        this.successMessage = '';

        const deleteSubscription = this._categoryService.deleteSubCategory(subCategory._id).subscribe({
            next: res => {
                this.subCategoriesList = this.subCategoriesList.filter(item => item._id !== subCategory._id);
                this.deletingSubCategoryId = '';
                this.successMessage = res.message;

                if (this.selectedSubCategoryId === subCategory._id) {
                    this.resetForm();
                }

                this._cdr.detectChanges();
            },
            error: err => {
                this.deletingSubCategoryId = '';
                this.errorMessage = err.error?.message || 'Failed to delete subcategory';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(deleteSubscription);
    }

    getCategoryId(subCategory: ISubCategory) {
        if (!subCategory.category) {
            return '';
        }

        return typeof subCategory.category === 'string' ? subCategory.category : subCategory.category._id;
    }

    getCategoryName(subCategory: ISubCategory) {
        if (!subCategory.category) {
            return 'Unknown Category';
        }

        if (typeof subCategory.category !== 'string') {
            return subCategory.category.name;
        }

        const category = this.categoriesList.find(item => item._id === subCategory.category);
        return category?.name || 'Unknown Category';
    }

    getCategoryStatus(subCategory: ISubCategory) {
        if (!subCategory.category) {
            return false;
        }

        if (typeof subCategory.category !== 'string') {
            return subCategory.category.isActive;
        }

        const category = this.categoriesList.find(item => item._id === subCategory.category);
        return category?.isActive ?? false;
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}