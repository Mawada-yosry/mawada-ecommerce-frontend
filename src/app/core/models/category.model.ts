export interface ICategory {
    _id: string;
    name: string;
    slug: string;
    image: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface ISubCategory {
    _id: string;
    name: string;
    slug: string;
    category: ICategory | string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface ICategoryData {
    name: string;
}
export interface ICategoryStatusResponse {
    message: string;
    data: ICategory;
}
export interface ICategoryMessageResponse {
    message: string;
}
export interface ISubCategoryData {
    name: string;
    category: string;
}
export interface ISubCategoryStatusResponse {
    message: string;
    data: ISubCategory;
}
export interface ISubCategoryMessageResponse {
    message: string;
}