import { IProductPayload } from "@/interface/admin.product";
import axios from "@/utils/axoisCustom";

export function fetchAllProduct(page: number, limit: number) {
    return axios.get('admin/product', {
        params: {
            page,
            limit
        }
    });
}

export function fetchProductById(id: number) {
    return axios.get(`admin/product/${id}`);
}

export function storeProduct(data: IProductPayload) {
    console.log(123)
    // const formData = new FormData();
    // formData.append('product_name', data.product_name);
    // formData.append('sku', data.sku);
    // formData.append('brand_id', data.brand_id.toString());
    // formData.append('description', data.description);
    // formData.append('short_description', data.short_description);
    // formData.append('product_weight', data.product_weight.toString());
    // formData.append('is_published', data.is_published.toString());
    // formData.append('is_featured', data.is_featured.toString());
    // formData.append('options', JSON.stringify(data.options));
    // formData.append('skus', JSON.stringify(data.skus));
    console.log(data)
    return axios.post('admin/product', data, {
       
    });
}