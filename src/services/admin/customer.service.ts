import { ICustomerPayload, ICustomerState } from "@/interface/admin.customer";
import axios from "@/utils/axoisCustom";

export function fetchAllCustomer(page: number, limit: number): Promise<ICustomerState> {
    return axios.get('admin/customer', {
        params: {
            page,
            limit
        }
    });
}

export function changeCustomerStatus(id: number) {
    return axios.patch(`admin/customer/change-status`, { id });
}

export function createCustomer(data: ICustomerPayload) {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('password', data.password);
    if (data.avatar !== null) {
        formData.append('avatar', data.avatar);
    }
    formData.append('role', data.role);
    formData.append('is_active', data.is_active);
    return axios.post('admin/customer', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}