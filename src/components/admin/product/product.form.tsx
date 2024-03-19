import { useEffect, useState } from 'react';
import { CloseOutlined, PlusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, InputNumber, Row, Select, Space, Modal, Upload, App } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { IOption, IProductPayload, IProductProps, ISku, ISkuValue } from '@interface/admin.product';
import SubmitButton from '@components/button/submit';
import { v4 as uuidv4 } from 'uuid';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteImageProduct, storeProduct, updateProduct } from '@/services/admin/product.service';
import { fetchBrand } from '@/services/admin/brand.service';
import { fetchCategoriesParent } from '@/services/admin/categories.service';
import type { GetProp, UploadFile, UploadProps } from 'antd';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

// tạo biến thể từ options
function generateSkus(options: IOption, skuValue: string) {
    const skus: ISku[] = [];
    const skuId = uuidv4();
    let skuIndex = 1;
    function generateSkuRecursive(index: number, values: ISkuValue[]) {
        if (Array.isArray(options) && index === options.length) {
            skus.push({
                "id": skuId,
                "sku": `${skuValue}_${skuIndex++}`,
                "price": 0,
                "quantity": 0,
                "values": values,
                "image": []
            });
            return;
        }

        const option = options[index] as IOption;
        for (const optionValues of option.option_values) {
            generateSkuRecursive(
                index + 1,
                [
                    ...values,
                    {
                        "option_id": option.id,
                        "option_name": option.option_name,
                        "value_id": optionValues.id,
                        "value": optionValues.value
                    }
                ]
            );
        }
    }

    generateSkuRecursive(0, []);

    return skus;
}
// Tạo ngẫu nhiên mã sku

const generateSkuValue = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const year = new Date().getFullYear().toString().slice(-2);
    let sku = '';
    for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        sku += characters[randomIndex];
    }
    sku += year;
    return sku;
};

const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

const normFile = (e: any) => {
    // console.log('Upload event:', e);
    if (Array.isArray(e)) {
        return e;
    }
    return e?.fileList;
};

const ProductForm = (props: IProductProps) => {
    const { product } = props;
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [skuValue] = useState(generateSkuValue());
    const handleCancel = () => setPreviewOpen(false);
    const { message } = App.useApp();
    const [form] = Form.useForm();

    const createNewProduct = useMutation({
        mutationFn: async (data: FormData) => await storeProduct(data),
        onSuccess: () => {
            form.resetFields();
            message.success('Tạo mới sản phẩm thành công');
        },
        onError: () => {
            message.error('Đã có lỗi xảy ra khi tạo mới sản phẩm');
        },
    })

    const editProduct = useMutation({
        mutationFn: async (data: FormData) => await updateProduct(data),
        onSuccess: () => {
            // form.resetFields();
            message.success('Cập nhật sản phẩm thành công');
        },
        onError: () => {
            message.error('Đã có lỗi xảy ra khi cập nhật sản phẩm');
        },
    })

    const deleteImage = useMutation({
        mutationFn: async (id: number) => await deleteImageProduct(id),
        onSuccess: () => {
            message.success('Xóa ảnh thành công');
        },
        onError: () => {
            message.error('Đã có lỗi xảy ra khi xóa ảnh');
        },
    })

    const { data: brand } = useQuery({
        queryKey: ['fetchBrand'],
        queryFn: async () => await fetchBrand(),
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5,
    })
    const { data: categories } = useQuery({
        queryKey: ['fetchAllCategories'],
        queryFn: async () => await fetchCategoriesParent(),
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5,
    })

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
    };

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>
        setFileList(newFileList);
    const handleRomve = (file: UploadFile) => {
        if (file.response) {
            deleteImage.mutate(file.response.id, {
                onError: () => {
                    message.error('Đã có lỗi xảy ra khi xóa ảnh');
                    return false;
                }
            });
            return;
        }
        deleteImage.mutate(file.uid as unknown as number, {
            onError: () => {
                message.error('Đã có lỗi xảy ra khi xóa ảnh');
                return false;
            }
        });
    }
    const uploadButton = (
        <button style={{ border: 0, background: 'none' }} type="button">
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </button>
    );

    useEffect(() => {
        if (product) {
            form.setFieldsValue({
                product_name: product?.product_name,
                sku: product?.sku,
                brand_id: product?.brand_id,
                description: product?.description,
                short_description: product?.short_description,
                product_weight: product?.product_weight,
                is_published: product?.is_published ? '1' : '0',
                is_featured: product?.is_featured ? '1' : '0',
                // image:product?.image ? product?.image.map((image:{id:number,path:string}) => ({ uid: image.id, url: image.path })) : [],
                options: product?.options,
                skus: product?.skus,
                category: product?.category
            });
            form.setFieldsValue({
                image_current: product?.image ? product?.image.map((image: { id: number, path: string }) => ({ uid: image.id, url: image.path })) : []
            });

            form.setFieldsValue({
                skus: product?.skus.map((skus: ISku) => ({
                    ...skus,
                    image: [],
                    image_skus_current: skus?.image ? skus?.image.map((images: { id: number, path: string }) => ({ uid: images.id, url: images.path })) : []
                }))
            });
            console.log(product);
        }
    }, [product, form]);

    const makeVariant = () => {
        const skus = generateSkus(form.getFieldValue('options'), skuValue);
        form.setFieldsValue({ skus });
    }
    const onFinish = (values: IProductPayload) => {
        const formdata = new FormData();
        formdata.append('product_name', values.product_name);
        formdata.append('sku', values.sku);
        formdata.append('brand_id', values.brand_id.toString());
        formdata.append('description', values.description);
        formdata.append('short_description', values.short_description);
        if (values.product_weight) {
            formdata.append('product_weight', values?.product_weight?.toString());
        }
        formdata.append('is_published', values.is_published.toString());
        formdata.append('is_featured', values.is_featured.toString());
        if (values.image) {
            formdata.append('image', JSON.stringify(values.image));
        }
        formdata.append('category', JSON.stringify(values.category));
        formdata.append('options', JSON.stringify(values.options));
        formdata.append('skus', JSON.stringify(values.skus));
        if (product) {
            formdata.append('id', product?.id?.toString() ?? "");
            editProduct.mutate(formdata);
            console.log(values);
            return;
        }
        console.log(values);
        createNewProduct.mutate(formdata);
    }



    return (
        <>
            <Form
                form={form}
                name="dynamic_form_complex"
                layout='vertical'
                autoComplete="off"
                onFinish={onFinish}
            >
                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} wrap={true}>
                    <Col xs={24} sm={24} md={11} lg={8} xl={12}>
                        <Form.Item
                            label="Tên sản phẩm"
                            name="product_name"
                            rules={[
                                { required: true, message: 'Vui lòng nhập tên sản phẩm' },
                                { min: 2, message: 'Tên sản phẩm phải lớn hơn 2 ký tự' }
                            ]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={7} lg={8} xl={8}>
                        <Form.Item
                            label="Sku"
                            name="sku"
                            initialValue={skuValue}
                            rules={[
                                { required: true, message: 'Vui lòng nhập sku' },
                                { min: 2, message: 'Sku phải lớn hơn 2 ký tự' }
                            ]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={6} lg={8} xl={4}>
                        <Form.Item
                            label="Trọng lượng (gram)"
                            name="product_weight"
                            rules={[
                                { type: 'number', message: 'Trọng lượng sản phẩm phải là số' }
                            ]}
                        >
                            <InputNumber
                                prefix="(g)"
                                min={0}
                                style={{ width: "100%" }}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item label="Mô tả" name="description" rules={
                    [
                        { required: true, message: 'Vui lòng nhập mô tả' },
                        { min: 10, message: 'Mô tả phải lớn hơn 10 ký tự' }
                    ]
                }>
                    <TextArea
                        placeholder="Mô tả"
                        autoSize={{ minRows: 3, maxRows: 5 }}
                    />
                </Form.Item>
                <Form.Item label="Mô tả ngắn" name="short_description" rules={
                    [
                        { required: true, message: 'Vui lòng nhập mô tả' },
                        { min: 10, message: 'Mô tả phải lớn hơn 10 ký tự' }
                    ]
                }>
                    <TextArea
                        placeholder="Mô tả ngắn"
                        autoSize={{ minRows: 3, maxRows: 5 }}
                    />
                </Form.Item>
                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} wrap={true}>
                    <Col span={12}>
                        <Form.Item
                            label="Thương hiệu"
                            name="brand_id"
                            rules={[{ required: true, message: 'Vui lòng chọn thương hiệu' }]}
                        >
                            <Select
                                placeholder="Chọn thương hiệu"
                                options={brand?.data.map((item: any) => ({ label: item.name, value: item.id }))}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Danh mục"
                            name="category"
                            rules={[{ required: true, message: 'Vui lòng chọn thương hiệu' }]}
                        >
                            <Select
                                placeholder="Chọn danh mục"
                                mode="multiple"
                                allowClear
                                options={categories?.data.map((item: any) => ({ label: item.category_name, value: item.id }))}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} wrap={true}>
                    <Col span={12}>
                        <Form.Item
                            label="Trạng thái"
                            name="is_published"
                            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                        >
                            <Select placeholder="Chọn trạng thái">
                                <Select.Option value="1">Kích hoạt</Select.Option>
                                <Select.Option value="0">Chưa kích hoạt</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Nổi bật" name="is_featured" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
                            <Select placeholder="Chọn trạng thái nổi bật">
                                <Select.Option value="1">Kích hoạt</Select.Option>
                                <Select.Option value="0">Chưa kích hoạt</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item label="Hình ảnh hiện tại" name="image_current"
                    valuePropName="fileList" getValueFromEvent={normFile}
                    hidden={product ? false : true}
                >
                    <Upload
                        // action={import.meta.env.VITE_API_URL + 'media'}
                        name='image_current'
                        listType="picture-card"
                        accept='image/*'
                        onPreview={handlePreview}
                        onRemove={(image) => handleRomve(image)}
                        // fileList={fileList}
                        beforeUpload={() => false}
                    />
                </Form.Item>
                <Form.Item label="Hình ảnh" name="image"
                    valuePropName="fileList" getValueFromEvent={normFile}
                >
                    <Upload
                        action={import.meta.env.VITE_API_URL + 'media'}
                        name='image'
                        listType="picture-card"
                        accept='image/*'
                        onPreview={handlePreview}
                        onChange={handleChange}
                        onRemove={(image) => handleRomve(image)}
                        maxCount={1}
                    >
                        {fileList.length >= 1 ? null : uploadButton}
                    </Upload>

                </Form.Item>
                <Card
                    size="default"
                    title="Options"
                >
                    <Form.List name="options"
                        initialValue={[{
                            "id": uuidv4(),
                            "option_name": "Size",
                            "option_values": [
                                { "id": uuidv4(), "value": "S" },
                                { "id": uuidv4(), "value": "M" },
                                { "id": uuidv4(), "value": "L" }
                            ]
                        }]}
                    >
                        {(fields, { add, remove }) => (
                            <div style={{ display: 'flex', rowGap: 16, flexDirection: 'column' }}>
                                {fields.map((field) => (
                                    <Card
                                        size="small"
                                        title={`Option ${field.name + 1}`}
                                        key={field.key}
                                        extra={
                                            <CloseOutlined
                                                onClick={() => {
                                                    remove(field.name);
                                                }}
                                            />
                                        }
                                    >
                                        <Form.Item label="id" name={[field.name, 'id']} initialValue={uuidv4()} hidden={true}>
                                            <Input />
                                        </Form.Item>
                                        <Form.Item label="Tên option"
                                            name={[field.name, 'option_name']}
                                            rules={[{ required: true, message: 'Tên không được để trống' }]}
                                        >
                                            <Input />
                                        </Form.Item>

                                        {/* Nest Form.List */}
                                        <Form.Item label="Giá trị option">
                                            <Form.List name={[field.name, 'option_values']}>
                                                {(subFields, subOpt) => (
                                                    <div style={{ display: 'flex', flexDirection: 'column', rowGap: 16 }}>
                                                        {subFields.map((subField) => (
                                                            <Space key={subField.key}>
                                                                <Form.Item noStyle name={[subField.name, 'id']} initialValue={uuidv4()} hidden={true}>
                                                                    <Input placeholder={String(subField.key)} />
                                                                </Form.Item>
                                                                <Form.Item noStyle name={[subField.name, 'value']} rules={[{ required: true, message: "Giá trị không được để trống" }]}>
                                                                    <Input placeholder="Giá trị option" />
                                                                </Form.Item>
                                                                <CloseOutlined
                                                                    onClick={() => {
                                                                        subOpt.remove(subField.name);
                                                                    }}
                                                                />
                                                                <PlusCircleOutlined
                                                                    onClick={() => subOpt.add()}
                                                                />
                                                            </Space>
                                                        ))}
                                                        {subFields.length === 0 && (
                                                            <Button type="dashed" onClick={() => subOpt.add()} block>
                                                                + Thêm giá trị
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </Form.List>
                                        </Form.Item>
                                    </Card>
                                ))}
                                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                                    <Col className="gutter-row" xs={24} sm={8} md={8} lg={8} xl={8}>
                                        <Button type="dashed" onClick={() => add()} block>
                                            + Thêm option
                                        </Button>
                                    </Col>
                                    <Col className="gutter-row" xs={24} sm={16} md={16} lg={16} xl={16}>
                                        {fields.length !== 0 && (
                                            <Button type="primary" onClick={makeVariant} block>Tạo biến thể</Button>
                                        )}
                                    </Col>
                                </Row>
                            </div>
                        )}
                    </Form.List>
                </Card>
                <Card
                    size="default"
                    title="Biến thể"
                >
                    <Form.List name="skus">
                        {(fields, { remove }) => (
                            <div style={{ display: 'flex', rowGap: 16, flexDirection: 'column' }}>
                                {fields.map((field) => (
                                    <Card
                                        size="small"
                                        title={`Biến thể ${field.name + 1}`}
                                        key={field.key}
                                        extra={
                                            <CloseOutlined
                                                onClick={() => {
                                                    remove(field.name);
                                                }}
                                            />
                                        }
                                    >

                                                <Form.Item label="id" name={[field.name, 'id']} initialValue={uuidv4()} hidden={true}>
                                                    <Input />
                                                </Form.Item>
                                                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                                                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                                                        <Form.Item label="Sku" name={[field.name, 'sku']} rules={[{ required: true, message: "Vui lòng nhập sku" }]}>
                                                            <Input />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                                                        <Form.Item label="Giá" name={[field.name, 'price']}
                                                            rules={[
                                                                { required: true, message: "Vui lòng nhập giá" },
                                                                { type: 'number', message: "Giá phải là số" },
                                                                { pattern: /^[0-9]*$/, message: "Giá phải là số" }
                                                            ]}
                                                        >
                                                            <InputNumber
                                                                prefix="đ" style={{ width: '100%' }}
                                                                min={1}
                                                                max={1000000000}
                                                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col xs={24} sm={24} md={4} lg={4} xl={4}>
                                                        <Form.Item label="Số lượng" name={[field.name, 'quantity']}
                                                            rules={[
                                                                { required: true, message: "Vui lòng nhập số lượng" },
                                                                { type: 'number', message: "Số lượng phải là số" },
                                                                { pattern: /^[0-9]*$/, message: "Giá phải là số" },
                                                            ]}
                                                        >
                                                            <InputNumber
                                                                style={{ width: '100%' }}
                                                                min={1}
                                                                max={1000000}
                                                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
                                        <Form.Item label="Biến thể">
                                            <Form.List name={[field.name, 'values']}>
                                                {(subFields) => (
                                                    <div style={{ display: 'flex', flexDirection: 'column', rowGap: 16 }}>
                                                        {subFields.map((subField) => (
                                                            <Space key={subField.key}>
                                                                <Form.Item noStyle name={[subField.name, 'option_id']} hidden>
                                                                    <Input placeholder={String(subField.key)} />
                                                                </Form.Item>
                                                                <Form.Item noStyle name={[subField.name, 'option_name']} label={[subField.name, 'option_name']} >
                                                                    <Input placeholder="Tên option" disabled />
                                                                </Form.Item>
                                                                <Form.Item noStyle name={[subField.name, 'value_id']} hidden>
                                                                    <Input placeholder="Giá trị option" />
                                                                </Form.Item>
                                                                <Form.Item noStyle name={[subField.name, 'value']}>
                                                                    <Input placeholder="Giá trị option" disabled />
                                                                </Form.Item>
                                                            </Space>
                                                        ))}
                                                    </div>
                                                )}
                                            </Form.List>
                                        </Form.Item>
                                        <Form.Item label="Hình ảnh hiện tại" name={[field.name, 'image_skus_current']}
                                            valuePropName="fileList" getValueFromEvent={normFile}
                                            hidden={product ? false : true}
                                        >
                                            <Upload
                                                name='image_skus_current'
                                                listType="picture-card"
                                                accept='image/*'
                                                onPreview={handlePreview}
                                                onRemove={(image) => handleRomve(image)}
                                                // fileList={fileList}
                                                beforeUpload={() => false}
                                            />
                                        </Form.Item>
                                        <Form.Item label="Hình ảnh" name={[field.name, 'image']}
                                            valuePropName="fileList" getValueFromEvent={normFile}
                                        >
                                            <Upload
                                                action={import.meta.env.VITE_API_URL + 'media'}
                                                name='image'
                                                listType="picture-card"
                                                multiple
                                                accept='image/*'
                                                onPreview={handlePreview}
                                                onChange={handleChange}
                                                onRemove={(image) => handleRomve(image)}
                                                maxCount={5}
                                            // beforeUpload={() => false}
                                            >
                                                {fileList.length >= 5 ? null : uploadButton}
                                            </Upload>
                                        </Form.Item>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </Form.List>
                </Card>
                <Form.Item style={{ margin: "1em 0", display: "flex", justifyContent: "flex-end" }}>
                    {/* <SubmitButton form={form} >Lưu</SubmitButton> */}
                    <Button type="primary" htmlType="submit">Lưu</Button>
                </Form.Item>
                {/* <Form.Item noStyle shouldUpdate>
                    {() => (
                        <Typography>
                            <pre>{JSON.stringify(form.getFieldsValue(), null, 2)}</pre>
                        </Typography>
                    )}
                </Form.Item> */}
            </Form >
            <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
                <img alt="Ảnh" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </>
    );
};

export default ProductForm;