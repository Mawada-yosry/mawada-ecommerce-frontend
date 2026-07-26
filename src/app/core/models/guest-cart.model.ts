import { IProduct } from './product.model';

export interface IGuestCartItem {
    product: IProduct;
    quantity: number;
}