import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { env } from '../../../env/env';
import { ICreateTestimonialData, ITestimonial, ITestimonialMessageResponse, ITestimonialStatusResponse, TestimonialStatus } from '../models/testimonial.model';

@Injectable({
    providedIn: 'root'
})
export class TestimonialService {
    private apiURL = env.apiURL + 'testimonial';
    constructor(private _http: HttpClient) {}
    getApprovedTestimonials() {
        return this._http.get<ITestimonial[]>(this.apiURL);
    }
    getMyTestimonials() {
        return this._http.get<ITestimonial[]>(this.apiURL + '/my');
    }
    createTestimonial(data: ICreateTestimonialData) {
        return this._http.post<ITestimonial>(this.apiURL, data);
    }
    getAllTestimonialsForAdmin(status?: TestimonialStatus | '') {
        let params = new HttpParams();
        if (status) {
            params = params.set('status', status);
        }
        return this._http.get<ITestimonial[]>(this.apiURL + '/admin/all', { params });
    }
    updateTestimonialStatus(id: string, status: TestimonialStatus) {
        return this._http.patch<ITestimonialStatusResponse>(this.apiURL + '/' + id + '/status', { status });
    }
    deleteTestimonial(id: string) {
        return this._http.delete<ITestimonialMessageResponse>(this.apiURL + '/' + id);
    }
}