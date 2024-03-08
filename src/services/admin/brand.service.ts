import {IBrand, IBrandPayload } from "@interface/admin.brand";
import axios from "@utils/axoisCustom";

export function fetchAllBrand(page: number, limit: number) {
    return axios.get('admin/brand', {
        params: {
            page,
            limit
        }
    });
}

export function fetchBrand(){
    return axios.get(`admin/brand/all`);
}

export function changeBrandStatus(id: number): Promise<IBrand> {
    return axios.patch(`admin/brand/change-status/${id}`);
}

export function changeBrandFeatured(id: number): Promise<IBrand>{
    return axios.patch(`admin/brand/change-featured/${id}`);
}

export function createBrand(data: IBrandPayload): Promise<IBrand> {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.logo !== null && data.logo !== undefined) {
        formData.append('logo', data.logo);
    }
    formData.append('description', data.description || '');
    formData.append('is_active', data.is_active.toString());
    formData.append('featured', data.featured.toString());
    return axios.post('admin/brand', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

export function updateBrand(data: IBrandPayload): Promise<IBrand> {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.logo !== null && data.logo !== undefined) {
        formData.append('logo', data.logo);
    }
    formData.append('description', data.description || '');
    formData.append('is_active', data.is_active.toString());
    formData.append('featured', data.featured.toString());
    return axios.post(`admin/brand/${data.id}?_method=PUT`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

export function deleteBrand(id: number): Promise<IBrand> {
    return axios.delete(`admin/brand/${id}`);
}