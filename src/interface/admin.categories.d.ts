export interface ICategories {
    id?: number;
    parent_id?: number;
    category_name: string;
    slug: string;
    category_description: string;
    icon?: string | object;
    active: boolean;
    children?: ICategories[];
}

export interface ICategoriesPayload {
    id?: number;
    parent_id?: number|null;
    category_name: string;
    category_description?: string;
    icon?: File | string | null | undefined;
    active: boolean|number;
}

export interface ICategoriesState {
    status: number,
    data: ICategories[],
    meta?: {
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

export interface ICategoriesModal {
    open: boolean,
    setOpen: (open: boolean) => void,
    CategoriesEdit?: ICategories | null,
    setCategoriesEdit: (Categories: ICategories) => void,
    isEdit: boolean,
    setIsEdit: (isEdit: boolean) => void
}