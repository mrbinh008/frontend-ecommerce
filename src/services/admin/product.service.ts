import { IProductState } from "@/interface/admin.product";
import axios from "@/utils/axoisCustom";

export function fetchAllProduct(page: number, limit: number): Promise<IProductState>{
    return axios.get('admin/product', {
        params: {
            page,
            limit
        }
    });
}

export function fetchProductById(id: number){
    return axios.get(`admin/product/${id}/detail`);
}

export function storeProduct(data: FormData) {
    return axios.post('admin/product', data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

export function changeStatusProduct(id: number) {
    return axios.patch(`admin/product/change-status/${id}`);
}
export function changeFeaturedProduct(id: number) {
    return axios.patch(`admin/product/change-featured/${id}`);
}
export function deleteProduct(id: number) {
    return axios.delete(`admin/product/${id}`);
}