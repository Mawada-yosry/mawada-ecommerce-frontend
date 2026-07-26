export interface IDynamicPage {
    _id: string;
    pageKey: string;
    title: string;
    content: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface IDynamicPageData {
    pageKey: string;
    title: string;
    content: string;
}
export interface IDynamicPageStatusResponse {
    message: string;
    data: IDynamicPage;
}
export interface IDynamicPageMessageResponse {
    message: string;
}