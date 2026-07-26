import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ICategory } from '../../core/models/category.model';
import { IProduct } from '../../core/models/product.model';
import { ITestimonial } from '../../core/models/testimonial.model';
import { CategoryService } from '../../core/services/category';
import { ProductService } from '../../core/services/product';
import { TestimonialService } from '../../core/services/testimonial';
import { Product } from '../products/product/product';

@Component({
    selector: 'app-home',
    imports: [RouterLink, Product],
    templateUrl: './home.html',
    styleUrl: './home.css'
})
export class Home implements OnInit, OnDestroy {
    categoriesList: ICategory[] = [];
    productsList: IProduct[] = [];
    testimonialsList: ITestimonial[] = [];
    isLoadingCategories = true;
    isLoadingProducts = true;
    isLoadingTestimonials = true;
    errorMessage = '';
    private subscriptions = new Subscription();

    constructor(private _categoryService: CategoryService, private _productService: ProductService, private _testimonialService: TestimonialService, private _cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.getCategories();
        this.getProducts();
        this.getTestimonials();
    }

    getCategories() {
        const categorySubscription = this._categoryService.getCategories().subscribe({
            next: res => {
                this.categoriesList = res;
                this.isLoadingCategories = false;
                this._cdr.detectChanges();
            },
            error: err => {
                this.isLoadingCategories = false;
                this.errorMessage = err.error?.message || 'Failed to load categories';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(categorySubscription);
    }

    getProducts() {
        const productSubscription = this._productService.getAllProducts('', '', '', '-createdAt').subscribe({
            next: res => {
                this.productsList = res.slice(0, 4);
                this.isLoadingProducts = false;
                this._cdr.detectChanges();
            },
            error: err => {
                this.isLoadingProducts = false;
                this.errorMessage = err.error?.message || 'Failed to load products';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(productSubscription);
    }

    getTestimonials() {
        const testimonialSubscription = this._testimonialService.getApprovedTestimonials().subscribe({
            next: res => {
                this.testimonialsList = res.slice(0, 3);
                this.isLoadingTestimonials = false;
                this._cdr.detectChanges();
            },
            error: err => {
                this.isLoadingTestimonials = false;
                this.errorMessage = err.error?.message || 'Failed to load testimonials';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(testimonialSubscription);
    }

    getUserName(testimonial: ITestimonial) {
        return typeof testimonial.user === 'string' ? 'Customer' : testimonial.user.name;
    }

    getStars(rating: number) {
        return Array(rating).fill(0);
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}