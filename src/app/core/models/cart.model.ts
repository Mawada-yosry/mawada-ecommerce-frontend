export interface ICartCategory {
    _id: string;
    name: string;
    isActive: boolean;
    isDeleted: boolean;
}
export interface ICartSubCategory {
    _id: string;
    name: string;
    category: string;
    isActive: boolean;
    isDeleted: boolean;
}
export interface ICartProduct {
    _id: string;
    name: string;
    price: number;
    image: string;
    slug: string;
    stockQuantity: number;
    isActive: boolean;
    isDeleted: boolean;
    category: ICartCategory;
    subCategory: ICartSubCategory;
}
export interface ICartItem {
    _id: string;
    product: ICartProduct;
    quantity: number;
    price: number;
    isPriceChanged: boolean;
    currentPrice: number;
    savedLineTotal: number;
    currentLineTotal: number;
    isAvailable: boolean;
    availableStock: number;
    exceedsStock: boolean;
}
export interface ICart {
    _id: string;
    user: string;
    items: ICartItem[];
    totalPrice: number;
    totalItems: number;
    currentTotalPrice: number;
    createdAt: string;
    updatedAt: string;
}
export interface IAcceptPriceResponse {
    message: string;
    cart: ICart;
}
export interface IClearCartResponse {
    message: string;
    cart: ICart;
}