export interface IProductPayload {
    id?: number,
    product_name:string,
    sku: string,
    brand_id: number,
    description: string,
    short_description: string,
    product_weight: number,
    is_published: boolean,
    is_featured: boolean,
    image: any|undefined|never,
    options: IOption[],
    skus: ISku[],
    category:[]
}

export interface IProduct {
    id: number,
    product_name:string,
    sku: string,
    brand_name: number,
    description: string|null,
    short_description: string|null,
    product_weight: number,
    is_published: boolean|undefined,
    is_featured: boolean|undefined,
    image: string,
    total_quantity:number,
    price: number|string,
}

export interface IProductState {
    status: number,
    data: IProduct[],
    meta?: {
        current_page: number,
        total_items: number,
        from: number,
        to: number,
        nextPage: string | null,
        prevPage: string | null,
        per_page: number,
    },
    message: null | string,
    error: null | string | object
}

export interface IOption {
    id: number|string,
    option_name: string,
    option_values: IOptionValue[],
}

export interface IOptionValue {
    id: number|string,
    value: string,
}

export interface ISku {
    id: number|string,
    sku: string,
    price: number,
    quantity: number,
    values: ISkuValue[],
}

export interface ISkuValue {
    option_id: number|string,
    value_id: number|string,
    option_name: string,
    value: string,
}

export interface IProductProps {
    product: IProductPayload,
    // loading: boolean,
    // error: null | string | object,
    // message: null | string,
}

