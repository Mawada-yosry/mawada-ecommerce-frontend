import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ITestimonial, TestimonialStatus } from '../../core/models/testimonial.model';
import { TestimonialService } from '../../core/services/testimonial';

@Component({
    selector: 'app-dashboard-testimonials',
    imports: [ReactiveFormsModule, DatePipe],
    templateUrl: './testimonials.html',
    styleUrl: './testimonials.css'
})
export class DashboardTestimonials implements OnInit, OnDestroy {
    testimonialsList: ITestimonial[] = [];
    isLoading = true;
    updatingTestimonialId = '';
    deletingTestimonialId = '';
    errorMessage = '';
    successMessage = '';
    private subscriptions = new Subscription();

    testimonialStatuses: TestimonialStatus[] = ['Pending', 'Approved', 'Rejected'];

    filterForm = new FormGroup({
        status: new FormControl<TestimonialStatus | ''>('', { nonNullable: true })
    });

    constructor(private _testimonialService: TestimonialService, private _cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.getTestimonials();
    }

    getTestimonials() {
        const status = this.filterForm.controls.status.value;
        this.isLoading = true;
        this.errorMessage = '';

        const testimonialSubscription = this._testimonialService.getAllTestimonialsForAdmin(status).subscribe({
            next: res => {
                this.testimonialsList = res;
                this.isLoading = false;
                this._cdr.detectChanges();
            },
            error: err => {
                this.testimonialsList = [];
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Failed to load testimonials';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(testimonialSubscription);
    }

    clearFilter() {
        this.filterForm.controls.status.setValue('');
        this.getTestimonials();
    }

    updateStatus(testimonial: ITestimonial, value: string) {
        const status = value as TestimonialStatus;

        if (!this.testimonialStatuses.includes(status)) {
            this.errorMessage = 'Select a valid testimonial status';
            return;
        }

        this.updatingTestimonialId = testimonial._id;
        this.errorMessage = '';
        this.successMessage = '';

        const testimonialSubscription = this._testimonialService.updateTestimonialStatus(testimonial._id, status).subscribe({
            next: res => {
                const testimonialIndex = this.testimonialsList.findIndex(item => item._id === testimonial._id);

                if (testimonialIndex !== -1) {
                    this.testimonialsList[testimonialIndex] = res.data;
                }

                this.updatingTestimonialId = '';
                this.successMessage = res.message;
                this._cdr.detectChanges();
            },
            error: err => {
                this.updatingTestimonialId = '';
                this.errorMessage = err.error?.message || 'Failed to update testimonial status';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(testimonialSubscription);
    }

    deleteTestimonial(testimonial: ITestimonial) {
        const confirmed = confirm('Are you sure you want to delete this testimonial?');

        if (!confirmed) {
            return;
        }

        this.deletingTestimonialId = testimonial._id;
        this.errorMessage = '';
        this.successMessage = '';

        const testimonialSubscription = this._testimonialService.deleteTestimonial(testimonial._id).subscribe({
            next: res => {
                this.testimonialsList = this.testimonialsList.filter(item => item._id !== testimonial._id);
                this.deletingTestimonialId = '';
                this.successMessage = res.message;
                this._cdr.detectChanges();
            },
            error: err => {
                this.deletingTestimonialId = '';
                this.errorMessage = err.error?.message || 'Failed to delete testimonial';
                this._cdr.detectChanges();
            }
        });

        this.subscriptions.add(testimonialSubscription);
    }

    getUserName(testimonial: ITestimonial) {
        return typeof testimonial.user === 'string' ? 'Unknown Customer' : testimonial.user.name;
    }

    getUserEmail(testimonial: ITestimonial) {
        return typeof testimonial.user === 'string' ? '' : testimonial.user.email || '';
    }

    getUserPhone(testimonial: ITestimonial) {
        return typeof testimonial.user === 'string' ? '' : testimonial.user.phone || '';
    }

    getStars(rating: number) {
        return Array(rating).fill(0);
    }

    getStatusClass(status: TestimonialStatus) {
        if (status === 'Approved') {
            return 'approved-status';
        }

        if (status === 'Rejected') {
            return 'rejected-status';
        }

        return 'pending-status';
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}