import { useEffect, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import {
    Form,
    Input,
    Select,
    Upload,
    Modal,
    message,
} from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { GetProp, UploadFile, UploadProps } from 'antd';
import { createBrand, updateBrand } from '@/services/admin/brand.service';
import { IBrand, IBrandModal, IBrandPayload } from '@/interface/admin.brand';
import TextArea from 'antd/es/input/TextArea';

const normFile = (e: any) => {
    if (Array.isArray(e)) {
        return e;
    }
    return e?.fileList;
};

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

const BrandModal = (props: IBrandModal) => {
    const { open, setOpen, brandEdit, setBrandEdit, isEdit, setIsEdit } = props;
    const [messageApi, contextHolder] = message.useMessage();
    const queryClient = useQueryClient();
    const [form] = Form.useForm();
    const [logo, setLogo] = useState<File>();
    const [description, setDescription] = useState<string>('');
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const createNewBrand = useMutation({
        mutationFn: async (data: IBrandPayload) => await createBrand(data),
        onSuccess: () => {
            form.resetFields();
            setOpen(false);
            messageApi.success('Tạo mới thương hiệu thành công');
            queryClient.invalidateQueries({ queryKey: ["fetchAllBrand"] });
        },
        onError: () => {
            messageApi.error('An error has occurred');
        },
    })

    const editBrand = useMutation({
        mutationFn: async (data: IBrandPayload) => await updateBrand({...data, id: brandEdit?.id as number}),
        onSuccess: () => {
            form.resetFields();
            setOpen(false);
            messageApi.success('Tạo mới thương hiệu thành công');
            queryClient.invalidateQueries({ queryKey: ["fetchAllBrand"] });
        },
        onError: () => {
            messageApi.error('An error has occurred');
        },
    })

    const handleSubmit = (fieldsValue: IBrandPayload) => {
        const dataForm: IBrandPayload = {
            ...fieldsValue,
            logo,
        }
        if (isEdit) {
            editBrand.mutate({...dataForm, id: brandEdit?.id as number});
            return;
        }
        createNewBrand.mutate(dataForm);  
    };

    const handleCancel = () => {
        setOpen(false);
        form.resetFields();
        if (isEdit) {
            setIsEdit(false);
            setBrandEdit({} as IBrand);
        }
    }
    const handleFile = (file: any) => {
        setLogo(file.file);
    }

    useEffect(() => {
        if (isEdit) {
            form.setFieldsValue({
                name: brandEdit?.name,
                description: brandEdit?.description,
                featured: brandEdit?.featured ? '1' : '0',
                is_active: brandEdit?.is_active ? '1' : '0',
                logo:[{uid:"-1",url:brandEdit?.logo}],
            });  
        }
    }, [isEdit, brandEdit, form]);

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }
        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
    };


    return (
        <>
            {contextHolder}
            <Modal
                open={open}
                title={isEdit ? 'Cập nhật thương hiệu' : 'Thêm mới thương hiệu'}
                onOk={form.submit}
                onCancel={handleCancel}
                okText='Lưu'
                cancelText='Hủy'
                confirmLoading={createNewBrand.isPending}
            >
                <Form
                    layout="vertical"
                    style={{ maxWidth: 600 }}
                    onFinish={handleSubmit}
                    form={form}
                >
                    <Form.Item
                        label="Tên thương hiệu"
                        name="name"
                        validateStatus={createNewBrand.isError ? 'error' : 'success'}
                        rules={[
                            { required: true, message: 'Vui lòng nhập họ và tên' },
                            { min: 3, message: 'Họ và tên phải lớn hơn 3 ký tự' }
                        ]}

                    >
                        <Input value={122} />
                    </Form.Item>
                    <Form.Item
                        label="Mô tả"
                        name="description"
                        rules={[
                            { min: 3, message: 'Mô tả phải lớn hơn 3 ký tự' }
                        ]}
                    >
                        <TextArea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Mô tả"
                            autoSize={{ minRows: 3, maxRows: 5 }}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Nổi bật"
                        name='featured'
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái nổi bật' }]}
                    >
                        <Select>
                            <Select.Option value="1">Kích hoạt</Select.Option>
                            <Select.Option value="0">Chưa kích hoạt</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Trạng thái"
                        name='is_active'
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                    >
                        <Select>
                            <Select.Option value="1">Kích hoạt</Select.Option>
                            <Select.Option value="0">Chưa kích hoạt</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Logo"
                        valuePropName="fileList"
                        name='logo'
                        getValueFromEvent={normFile}
                        labelCol={{ span: 4 }}
                        wrapperCol={{ span: 14 }}

                    >
                        <Upload
                            name="logo"
                            listType="picture-card"
                            beforeUpload={() => false}
                            onChange={handleFile}
                            maxCount={1}
                            onPreview={handlePreview}
                        >
                            <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                        </Upload>
                    </Form.Item>
                    {createNewBrand.isError && <p style={{ color: 'red' }}>Có lỗi xảy ra</p>}
                </Form>
            </Modal >
            <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={() => setPreviewOpen(false)}>
                <img alt={previewTitle} style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </>
    );
};

export default BrandModal;

