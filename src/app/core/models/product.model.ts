export interface IProductCategory {
    _id: string;
    name: string;
    slug: string;
    image?: string;
    isActive?: boolean;
    isDeleted?: boolean;
}
export interface IProductSubCategory {
    _id: string;
    name: string;
    slug: string;
    category: string;
    isActive?: boolean;
    isDeleted?: boolean;
}
export interface IProduct {
    _id: string;
    name: string;
    description: string;
    price: number;
    discount: number;
    stockQuantity: number;
    image: string;
    category: IProductCategory;
    subCategory: IProductSubCategory;
    slug: string;
    isActive: boolean;
    isDeleted: boolean;
    stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
    createdAt: string;
    updatedAt: string;
}
export interface IProductStatusResponse {
    message: string;
    data: IProduct;
}
export interface IProductMessageResponse {
    message: string;
}