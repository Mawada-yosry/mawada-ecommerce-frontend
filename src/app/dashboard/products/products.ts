import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { env } from '../../../env/env';
import { ICategory, ISubCategory } from '../../core/models/category.model';
import { IProduct } from '../../core/models/product.model';
import { CategoryService } from '../../core/services/category';
import { ProductService } from '../../core/services/product';

@Component({
    selector: 'app-dashboard-products',
    imports: [ReactiveFormsModule],
    templateUrl: './products.html',
    styleUrl: './products.css'
})
export class Products implements OnInit, OnDestroy {
    productsList: IProduct[] = [];
    categoriesList: ICategory[] = [];
    subCategoriesList: ISubCategory[] = [];
    filteredSubCategoriesList: ISubCategory[] = [];
    filterSubCategoriesList: ISubCategory[] = [];
    selectedProductId = '';
    selectedImage: File | null = null;
    imagePreview = '';
    isLoading = true;
    isSaving = false;
    updatingProductId = '';
    deletingProductId = '';
    errorMessage = '';
    successMessage = '';
    staticURL = env.staticURL;
    private subscriptions = new Subscription();

    productForm = new FormGroup({
        name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        price: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
        discount: new FormControl<number>(0, { nonNullable: true, validators: [Validators.min(0)] }),
        stockQuantity: new FormControl<number | null>(null, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]),
        category: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        subCategory: new FormControl({ value: '', disabled: true }, { nonNullable: true, validators: [Validators.required] })
    });

    filterForm = new FormGroup({
        keyword: new FormControl('', { nonNullable: true }),
        category: new FormControl('', { nonNullable: true }),
        subCategory: new FormControl({ value: '', disabled: true }, { nonNullable: true })
    });

    constructor(private _productService: ProductService, private _categoryService: CategoryService, private _cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.getCategories();
        this.getSubCategories();
        this.getProducts();
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
        const subCategorySubscription = this._categoryService.getAllSubCategoriesForAdmin().subscribe({
            next: res => {
                this.subCategoriesList = res;
                this._cdr.detectChanges();
            },
            error: err => {
                this.errorMessage = err.error?.message || 'Failed to load subcategories';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(subCategorySubscription);
    }

    getProducts() {
        const keyword = this.filterForm.controls.keyword.value.trim();
        const category = this.filterForm.controls.category.value;
        const subCategory = this.filterForm.controls.subCategory.value;

        this.isLoading = true;
        this.errorMessage = '';

        const productSubscription = this._productService.getAllProductsForAdmin(keyword, category, subCategory).subscribe({
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

        this.subscriptions.add(productSubscription);
    }

    productCategoryChanged() {
        const categoryId = this.productForm.controls.category.value;
        this.productForm.controls.subCategory.setValue('');

        this.filteredSubCategoriesList = this.subCategoriesList.filter(subCategory => {
            return this.getSubCategoryParentId(subCategory) === categoryId && subCategory.isActive === true && subCategory.isDeleted !== true;
        });

        if (this.filteredSubCategoriesList.length > 0) {
            this.productForm.controls.subCategory.enable();
        } else {
            this.productForm.controls.subCategory.disable();
        }
    }

    filterCategoryChanged() {
        const categoryId = this.filterForm.controls.category.value;
        this.filterForm.controls.subCategory.setValue('');

        if (!categoryId) {
            this.filterSubCategoriesList = [];
            this.filterForm.controls.subCategory.disable();
            this.getProducts();
            return;
        }

        this.filterSubCategoriesList = this.subCategoriesList.filter(subCategory => this.getSubCategoryParentId(subCategory) === categoryId);

        if (this.filterSubCategoriesList.length > 0) {
            this.filterForm.controls.subCategory.enable();
        } else {
            this.filterForm.controls.subCategory.disable();
        }

        this.getProducts();
    }

    saveProduct() {
        if (this.productForm.invalid) {
            this.productForm.markAllAsTouched();
            return;
        }

        const formData = new FormData();
        formData.append('name', this.productForm.controls.name.value.trim());
        formData.append('description', this.productForm.controls.description.value.trim());
        formData.append('price', String(this.productForm.controls.price.value));
        formData.append('discount', String(this.productForm.controls.discount.value));
        formData.append('stockQuantity', String(this.productForm.controls.stockQuantity.value));
        formData.append('category', this.productForm.controls.category.value);
        formData.append('subCategory', this.productForm.controls.subCategory.value);

        if (this.selectedImage) {
            formData.append('image', this.selectedImage);
        }

        this.isSaving = true;
        this.errorMessage = '';
        this.successMessage = '';

        if (this.selectedProductId) {
            this.updateProduct(formData);
        } else {
            this.createProduct(formData);
        }
    }

    createProduct(data: FormData) {
        const productSubscription = this._productService.createProduct(data).subscribe({
            next: res => {
                this.productsList.unshift(res);
                this.isSaving = false;
                this.successMessage = 'Product created successfully';
                this.resetForm();
                this._cdr.detectChanges();
            },
            error: err => {
                this.isSaving = false;
                this.errorMessage = err.error?.message || 'Failed to create product';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(productSubscription);
    }

    updateProduct(data: FormData) {
        const productId = this.selectedProductId;

        const productSubscription = this._productService.updateProduct(productId, data).subscribe({
            next: res => {
                const productIndex = this.productsList.findIndex(product => product._id === productId);

                if (productIndex !== -1) {
                    this.productsList[productIndex] = res;
                }

                this.isSaving = false;
                this.successMessage = 'Product updated successfully';
                this.resetForm();
                this._cdr.detectChanges();
            },
            error: err => {
                this.isSaving = false;
                this.errorMessage = err.error?.message || 'Failed to update product';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(productSubscription);
    }

    editProduct(product: IProduct) {
        this.selectedProductId = product._id;
        this.selectedImage = null;
        this.imagePreview = this.staticURL + product.image;
        this.errorMessage = '';
        this.successMessage = '';

        this.filteredSubCategoriesList = this.subCategoriesList.filter(subCategory => {
            return this.getSubCategoryParentId(subCategory) === product.category._id && subCategory.isActive === true && subCategory.isDeleted !== true;
        });

        this.productForm.controls.subCategory.enable();

        this.productForm.patchValue({
            name: product.name,
            description: product.description,
            price: product.price,
            discount: product.discount,
            stockQuantity: product.stockQuantity,
            category: product.category._id,
            subCategory: product.subCategory._id
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    imageChanged(event: Event) {
        const input = event.target as HTMLInputElement;

        if (!input.files || input.files.length === 0) {
            this.selectedImage = null;
            return;
        }

        this.selectedImage = input.files[0];
        const reader = new FileReader();

        reader.onload = () => {
            this.imagePreview = String(reader.result);
            this._cdr.detectChanges();
        };

        reader.readAsDataURL(this.selectedImage);
    }

    resetForm() {
        this.selectedProductId = '';
        this.selectedImage = null;
        this.imagePreview = '';
        this.filteredSubCategoriesList = [];
        this.productForm.reset({
            name: '',
            description: '',
            price: null,
            discount: 0,
            stockQuantity: null,
            category: '',
            subCategory: ''
        });
        this.productForm.controls.subCategory.disable();
    }

    updateStatus(product: IProduct) {
        this.updatingProductId = product._id;
        this.errorMessage = '';
        this.successMessage = '';

        const productSubscription = this._productService.updateProductStatus(product._id, !product.isActive).subscribe({
            next: res => {
                const productIndex = this.productsList.findIndex(item => item._id === product._id);

                if (productIndex !== -1) {
                    this.productsList[productIndex].isActive = res.data.isActive;
                }

                this.updatingProductId = '';
                this.successMessage = res.message;
                this._cdr.detectChanges();
            },
            error: err => {
                this.updatingProductId = '';
                this.errorMessage = err.error?.message || 'Failed to update product status';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(productSubscription);
    }

    deleteProduct(product: IProduct) {
        const confirmed = confirm('Are you sure you want to delete this product?');

        if (!confirmed) {
            return;
        }

        this.deletingProductId = product._id;
        this.errorMessage = '';
        this.successMessage = '';

        const productSubscription = this._productService.deleteProduct(product._id).subscribe({
            next: res => {
                this.productsList = this.productsList.filter(item => item._id !== product._id);
                this.deletingProductId = '';
                this.successMessage = res.message;

                if (this.selectedProductId === product._id) {
                    this.resetForm();
                }

                this._cdr.detectChanges();
            },
            error: err => {
                this.deletingProductId = '';
                this.errorMessage = err.error?.message || 'Failed to delete product';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(productSubscription);
    }

    clearFilters() {
        this.filterForm.patchValue({
            keyword: '',
            category: '',
            subCategory: ''
        });

        this.filterSubCategoriesList = [];
        this.filterForm.controls.subCategory.disable();
        this.getProducts();
    }

    getSubCategoryParentId(subCategory: ISubCategory) {
        return typeof subCategory.category === 'string' ? subCategory.category : subCategory.category._id;
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}