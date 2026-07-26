import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { env } from '../../../../env/env';
import { IProduct } from '../../../core/models/product.model';

@Component({
    selector: 'app-product',
    imports: [RouterLink],
    templateUrl: './product.html',
    styleUrl: './product.css'
})
export class Product {
    @Input() myProduct!: IProduct;
    staticURL = env.staticURL;
}