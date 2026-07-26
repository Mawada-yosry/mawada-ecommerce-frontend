import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { env } from '../../../env/env';
import { ICancelOrderResponse, ICreateOrderData, ICreateOrderResponse, IOrder, IUpdateOrderStatusResponse, OrderStatus } from '../models/order.model';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private apiURL = env.apiURL + 'order';
    constructor(private _http: HttpClient) {}
    createOrder(data: ICreateOrderData) {
        return this._http.post<ICreateOrderResponse>(this.apiURL, data);
    }
    getMyOrders() {
        return this._http.get<IOrder[]>(this.apiURL);
    }
    getOrderById(id: string) {
        return this._http.get<IOrder>(this.apiURL + '/' + id);
    }
    cancelOrder(id: string) {
        return this._http.patch<ICancelOrderResponse>(this.apiURL + '/' + id + '/cancel', {});
    }
    getAllOrdersForAdmin(status?: OrderStatus | '') {
        let params = new HttpParams();
        if (status) {
            params = params.set('status', status);
        }
        return this._http.get<IOrder[]>(this.apiURL + '/admin/all', { params });
    }
    getOrderByIdForAdmin(id: string) {
        return this._http.get<IOrder>(this.apiURL + '/admin/' + id);
    }
    updateOrderStatus(id: string, orderStatus: OrderStatus) {
        return this._http.patch<IUpdateOrderStatusResponse>(this.apiURL + '/' + id + '/status', { orderStatus });
    }
}