import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ICategory, ISubCategory } from '../../core/models/category.model';
import { IProduct } from '../../core/models/product.model';
import { CategoryService } from '../../core/services/category';
import { ProductService } from '../../core/services/product';
import { Product } from './product/product';

@Component({
    selector: 'app-products',
    imports: [Product, ReactiveFormsModule, RouterLink],
    templateUrl: './products.html',
    styleUrl: './products.css'
})
export class Products implements OnInit, OnDestroy {
    productsList: IProduct[] = [];
    categoriesList: ICategory[] = [];
    subCategoriesList: ISubCategory[] = [];
    isLoading = true;
    errorMessage = '';
    selectedCategoryName = '';
    private subscriptions = new Subscription();

   filterForm = new FormGroup({
    keyword: new FormControl('', { nonNullable: true }),
    category: new FormControl('', { nonNullable: true }),
    subCategory: new FormControl({ value: '', disabled: true }, { nonNullable: true }),
    sort: new FormControl('-createdAt', { nonNullable: true })
});

    constructor(private _productService: ProductService, private _categoryService: CategoryService, private _activatedRoute: ActivatedRoute, private _cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.getCategories();

        const routeSubscription = this._activatedRoute.paramMap.subscribe(params => {
            const categorySlug = params.get('slug');

            if (categorySlug) {
                this.getCategoryBySlug(categorySlug);
            } else {
                this.selectedCategoryName = '';
                this.filterForm.patchValue({ category: '', subCategory: '' });
                this.subCategoriesList = [];
                this.getProducts();
            }
        });

        this.subscriptions.add(routeSubscription);
    }

    getCategories() {
        const categorySubscription = this._categoryService.getCategories().subscribe({
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

    getCategoryBySlug(slug: string) {
        this.isLoading = true;
        this.errorMessage = '';

        const categorySubscription = this._categoryService.getCategoryBySlug(slug).subscribe({
            next: category => {
                this.selectedCategoryName = category.name;
                this.filterForm.patchValue({ category: category._id, subCategory: '' });
                this.getSubCategories(category._id);
                this.getProducts();
            },
            error: err => {
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Category not found';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(categorySubscription);
    }

   getSubCategories(categoryId: string) {
    if (!categoryId) {
        this.subCategoriesList = [];
        this.filterForm.controls.subCategory.setValue('');
        this.filterForm.controls.subCategory.disable();
        return;
    }

    const subCategorySubscription = this._categoryService.getSubCategoriesByCategory(categoryId).subscribe({
        next: res => {
            this.subCategoriesList = res;

            if (res.length > 0) {
                this.filterForm.controls.subCategory.enable();
            } else {
                this.filterForm.controls.subCategory.setValue('');
                this.filterForm.controls.subCategory.disable();
            }

            this._cdr.detectChanges();
        },
        error: err => {
            this.subCategoriesList = [];
            this.filterForm.controls.subCategory.setValue('');
            this.filterForm.controls.subCategory.disable();
            this.errorMessage = err.error?.message || 'Failed to load subcategories';
            this._cdr.detectChanges();
        }
    });

    this.subscriptions.add(subCategorySubscription);
}
    getProducts() {
        const category = this.filterForm.controls.category.value;
        const subCategory = this.filterForm.controls.subCategory.value;
        const keyword = this.filterForm.controls.keyword.value.trim();
        const sort = this.filterForm.controls.sort.value;

        this.isLoading = true;
        this.errorMessage = '';

        const productsSubscription = this._productService.getAllProducts(category, subCategory, keyword, sort).subscribe({
            next: res => {
                this.productsList = res;
                this.isLoading = false;
                this._cdr.detectChanges();
            },
            error: err => {
                this.productsList = [];
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Failed to load products';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(productsSubscription);
    }

   categoryChanged() {
    const categoryId = this.filterForm.controls.category.value;
    this.filterForm.controls.subCategory.setValue('');
    this.selectedCategoryName = '';

    if (categoryId) {
        const category = this.categoriesList.find(item => item._id === categoryId);
        this.selectedCategoryName = category?.name || '';
        this.getSubCategories(categoryId);
    } else {
        this.subCategoriesList = [];
        this.filterForm.controls.subCategory.disable();
    }

    this.getProducts();
}
    subCategoryChanged() {
        this.getProducts();
    }

    sortChanged() {
        this.getProducts();
    }

    searchProducts() {
        this.getProducts();
    }

    clearFilters() {
    this.filterForm.patchValue({
        keyword: '',
        category: '',
        subCategory: '',
        sort: '-createdAt'
    });

    this.selectedCategoryName = '';
    this.subCategoriesList = [];
    this.filterForm.controls.subCategory.disable();
    this.getProducts();
}
    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}