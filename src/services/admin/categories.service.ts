import { ICategoriesPayload, ICategoriesState } from "@interface/admin.categories";
import axios from "@utils/axoisCustom";

export function fetchAllCategories(page: number, limit: number) {
    return axios.get('admin/category', {
        params: {
            page,
            limit
        }
    });
}

export function fetchCategoriesParent(): Promise<ICategoriesState> {
    return axios.get(`admin/category/all`);
}

export function fetchCategoriesChildren(id: number, page: number, limit: number): Promise<ICategoriesState> {
    return axios.get(`admin/category/children/${id}`, {
        params: {
            page,
            limit
        }
    });
}

export function changeCategoriesStatus(id: number): Promise<ICategoriesState> {
    return axios.patch(`admin/category/change-status/${id}`);
}


export function createCategories(data: ICategoriesPayload): Promise<ICategoriesState> {
    const formData = new FormData();
    if (typeof data.parent_id ==='number') {
        formData.append('parent_id', data.parent_id?.toString() || '');
    }
    formData.append('category_name', data.category_name);
    if (data.icon !== null && data.icon !== undefined) {
        formData.append('icon', data.icon);
    }
    formData.append('category_description', data.category_description || '');
    formData.append('active', data.active.toString());
    return axios.post('admin/category', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

export function updateCategories(data: ICategoriesPayload): Promise<ICategoriesState> {
    const formData = new FormData();
    if (typeof data.parent_id ==='number') {
        formData.append('parent_id', data.parent_id?.toString() || '');
    }
    formData.append('category_name', data.category_name);
    if (data.icon !== null && data.icon !== undefined) {
        formData.append('icon', data.icon);
    }
    formData.append('category_description', data.category_description || '');
    formData.append('active', data.active.toString());
    return axios.post(`admin/category/${data.id}?_method=PUT`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

export function deleteCategories(id: number): Promise<ICategoriesState> {
    return axios.delete(`admin/category/${id}`);
}