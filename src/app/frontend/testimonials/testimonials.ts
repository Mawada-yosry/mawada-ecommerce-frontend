import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ICreateTestimonialData, ITestimonial } from '../../core/models/testimonial.model';
import { AuthService } from '../../core/services/auth';
import { TestimonialService } from '../../core/services/testimonial';

@Component({
    selector: 'app-testimonials',
    imports: [ReactiveFormsModule, RouterLink, DatePipe],
    templateUrl: './testimonials.html',
    styleUrl: './testimonials.css'
})
export class Testimonials implements OnInit, OnDestroy {
    testimonialsList: ITestimonial[] = [];
    isLoading = true;
    isSubmitting = false;
    isLoggedIn = false;
    errorMessage = '';
    successMessage = '';
    private subscriptions = new Subscription();

    testimonialForm = new FormGroup({
        ratingStars: new FormControl(5, { nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(5)] }),
        message: new FormControl('', { nonNullable: true, validators: [Validators.required] })
    });

    constructor(private _testimonialService: TestimonialService, private _authService: AuthService, private _router: Router, private _cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.isLoggedIn = this._authService.isUser() !== null;
        this.getTestimonials();
    }

    getTestimonials() {
        this.isLoading = true;
        this.errorMessage = '';

        const testimonialSubscription = this._testimonialService.getApprovedTestimonials().subscribe({
            next: res => {
                this.testimonialsList = res;
                this.isLoading = false;
                this._cdr.detectChanges();
            },
            error: err => {
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Failed to load testimonials';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(testimonialSubscription);
    }

    submitTestimonial() {
        if (!this.isLoggedIn) {
            this._router.navigate(['/login']);
            return;
        }

        if (this.testimonialForm.invalid) {
            this.testimonialForm.markAllAsTouched();
            return;
        }

        const testimonialData: ICreateTestimonialData = {
            ratingStars: this.testimonialForm.controls.ratingStars.value,
            message: this.testimonialForm.controls.message.value.trim()
        };

        this.isSubmitting = true;
        this.errorMessage = '';
        this.successMessage = '';

        const testimonialSubscription = this._testimonialService.createTestimonial(testimonialData).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.successMessage = 'Your review was submitted and is waiting for approval';
                this.testimonialForm.reset({ ratingStars: 5, message: '' });
                this._cdr.detectChanges();
            },
            error: err => {
                this.isSubmitting = false;
                this.errorMessage = err.error?.message || 'Failed to submit testimonial';
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