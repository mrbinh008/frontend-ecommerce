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
    options: IOption[],
    skus: ISku[],
    category:[]
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

