export type TestimonialStatus = 'Pending' | 'Approved' | 'Rejected';

export interface ITestimonialUser {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
}
export interface ITestimonial {
    _id: string;
    user: ITestimonialUser | string;
    ratingStars: number;
    message: string;
    status: TestimonialStatus;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface ICreateTestimonialData {
    ratingStars: number;
    message: string;
}
export interface ITestimonialStatusResponse {
    message: string;
    data: ITestimonial;
}
export interface ITestimonialMessageResponse {
    message: string;
}