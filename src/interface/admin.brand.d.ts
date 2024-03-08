export interface IBrand {
    id?: number;
    name: string;
    logo?: string | object;
    description: string;
    is_active: boolean;
    featured: boolean;
}

export interface IBrandPayload {
    id?: number;
    name: string;
    logo?: File | string | null | undefined;
    description?: string;
    is_active: boolean|number;
    featured: boolean
}

export interface IBrandState {
    status: number,
    data: IBrand[],
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

export interface IBrandModal {
    open: boolean,
    setOpen: (open: boolean) => void,
    brandEdit?: IBrand | null,
    setBrandEdit: (brand: IBrand) => void,
    isEdit: boolean,
    setIsEdit: (isEdit: boolean) => void
}