export interface IUser {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    role: 'user' | 'admin';
    isActive?: boolean;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
export interface IRegisterData {
    name: string;
    email: string;
    phone: string;
    address: string;
    password: string;
}
export interface ILoginData {
    email?: string;
    phone?: string;
    password: string;
}
export interface ILoginResponse {
    JWT: string;
}
export interface IJWT {
    id: string;
    name: string;
    role: 'user' | 'admin';
    iat: number;
    exp: number;
}
export interface IProfileResponse {
    message: string;
    data: IUser;
}
export interface IUpdateProfileData {
    name: string;
    phone: string;
    address: string;
}
export interface IChangePasswordData {
    currentPassword: string;
    newPassword: string;
}
export interface IMessageResponse {
    message: string;
}
export interface IUsersResponse {
    message: string;
    data: IUser[];
}
export interface IUserResponse {
    message: string;
    data: IUser;
}