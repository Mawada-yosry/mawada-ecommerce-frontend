import { Routes } from '@angular/router';
import { Layout } from './frontend/layout/layout';
import { Home } from './frontend/home/home';
import { Login } from './frontend/auth/login/login';
import { Register } from './frontend/auth/register/register';
import { Dashboard } from './dashboard/dashboard/dashboard';
import { Home as DashboardHome } from './dashboard/home/home';
import { adminGuard } from './core/guards/admin-guard';
import { Products } from './frontend/products/products';
import { ProductDetails } from './frontend/product-details/product-details';
import { Cart } from './frontend/cart/cart';
import { authGuard } from './core/guards/auth-guard';
import { Checkout } from './frontend/checkout/checkout';
import { MyOrders } from './frontend/my-orders/my-orders';
import { OrderDetails } from './frontend/order-details/order-details';
import { Profile } from './frontend/profile/profile';
import { Testimonials } from './frontend/testimonials/testimonials';
import { DynamicPage } from './frontend/dynamic-page/dynamic-page';
import { Users } from './dashboard/users/users';
import { Categories } from './dashboard/categories/categories';
import { SubCategories } from './dashboard/sub-categories/sub-categories';
import { Products as DashboardProducts } from './dashboard/products/products';
import { Orders as DashboardOrders } from './dashboard/orders/orders';
import { OrderDetails as DashboardOrderDetails } from './dashboard/order-details/order-details';
import { DashboardTestimonials } from './dashboard/testimonials/testimonials';
import { Pages as DashboardPages } from './dashboard/pages/pages';

export const routes: Routes = [
    {
        path: '',
        component: Layout,
        children: [
            { path: 'home', component: Home },
            { path: 'products', component: Products },
            { path: 'products/category/:slug', component: Products },
            { path: 'products/:slug', component: ProductDetails },
            { path: 'cart', component: Cart },
            { path: 'checkout', component: Checkout, canActivate: [authGuard] },
            { path: 'orders', component: MyOrders, canActivate: [authGuard] },
{ path: 'orders/:id', component: OrderDetails, canActivate: [authGuard] },
           { path: 'profile', component: Profile, canActivate: [authGuard] },
           { path: 'testimonials', component: Testimonials },
           { path: 'pages/:pageKey', component: DynamicPage },
            { path: 'login', component: Login },
            { path: 'register', component: Register },
            
            
            { path: '', redirectTo: 'home', pathMatch: 'full' }
        ]
    },
    {
        path: 'dashboard',
        component: Dashboard,
        canActivate: [adminGuard],
        children: [
            { path: 'home', component: DashboardHome },
            { path: 'users', component: Users },
            { path: 'categories', component: Categories },
            { path: 'sub-categories', component: SubCategories },
            { path: 'products', component: DashboardProducts },
            { path: 'orders', component: DashboardOrders },
{ path: 'orders/:id', component: DashboardOrderDetails },
{ path: 'testimonials', component: DashboardTestimonials },
{ path: 'pages', component: DashboardPages },
            { path: '', redirectTo: 'home', pathMatch: 'full' }
        ]
    },
    { path: '**', redirectTo: 'home' }
];