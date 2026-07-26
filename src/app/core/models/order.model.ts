export type OrderStatus = 'Pending' | 'Prepared' | 'Shipped' | 'Received' | 'Rejected' | 'CancelledByUser' | 'CancelledByAdmin';
export interface IOrderUser {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
}
export interface IOrderProduct {
    _id: string;
    name: string;
    image: string;
    slug: string;
}
export interface IOrderItem {
    _id: string;
    product: IOrderProduct;
    quantity: number;
    price: number;
}
export interface IOrder {
    _id: string;
    user: IOrderUser | string;
    items: IOrderItem[];
    totalPrice: number;
    shippingAddress: string;
    shippingPhone: string;
    paymentMethod: 'Cash' | 'Card';
    orderStatus: OrderStatus;
    stockReturned: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface ICreateOrderData {
    shippingAddress: string;
    shippingPhone: string;
    paymentMethod: 'Cash';
}
export interface ICreateOrderResponse {
    _id: string;
    user: string;
    totalPrice: number;
    shippingAddress: string;
    shippingPhone: string;
    paymentMethod: 'Cash' | 'Card';
    orderStatus: OrderStatus;
    createdAt: string;
    updatedAt: string;
}
export interface ICancelOrderResponse {
    message: string;
    order: IOrder;
}
export interface IUpdateOrderStatusResponse {
    message: string;
    order: IOrder;
}