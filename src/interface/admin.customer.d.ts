export interface ICustomer {
    id: number;
    name: string;
    email: string;
    avatar: string | object;
    is_active: boolean;
    role: string;
    create_at: string | null;
}

export interface ICustomerPayload {
    name: string;
    email: string;
    password: string;
    avatar: File | string | null | object | undefined;
    role: string;
    is_active: boolean| number;
}

export interface ICustomerState {
    status: number,
    data: ICustomer[],
    meta: {
        current_page: number,
        total_page: number,
        from: number,
        to: number,
        nextPage: string | null,
        prevPage: string | null,
        per_page: number,
    },
    message: null | string,
    error: null | string | object
}

export interface ICustomerModal {
    open: boolean,
    setOpen: (open: boolean) => void,
    
}