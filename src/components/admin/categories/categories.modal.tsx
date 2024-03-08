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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { GetProp, UploadFile, UploadProps } from 'antd';
import { createCategories, fetchCategoriesParent, updateCategories } from '@services/admin/categories.service';
import { ICategories, ICategoriesModal, ICategoriesPayload } from '@/interface/admin.categories';
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

const filterOption = (input: string, option?: { label: string; value: string }) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase());


const CategoriesModal = (props: ICategoriesModal) => {
    const { open, setOpen, CategoriesEdit, setCategoriesEdit, isEdit, setIsEdit } = props;
    const [messageApi, contextHolder] = message.useMessage();
    const queryClient = useQueryClient();
    const [form] = Form.useForm();
    const [logo, setLogo] = useState<File>();
    const [description, setDescription] = useState<string>('');
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [errors, setErrors] = useState({} as any);
    const { isError, data: categoryParent } = useQuery({
        queryKey: ['fetchAllCategories'],
        queryFn: async () => await fetchCategoriesParent(),
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5,
    })

    const createNewCategories = useMutation({
        mutationFn: async (data: ICategoriesPayload) => await createCategories(data),
        onSuccess: () => {
            form.resetFields();
            setOpen(false);
            messageApi.success('Tạo mới thương hiệu thành công');
            queryClient.invalidateQueries({ queryKey: ["fetchAllCategories"] });
        },
        onError: () => {
            messageApi.error('An error has occurred');
        },
    })

    const editCategories = useMutation({
        mutationFn: async (data: ICategoriesPayload) => await updateCategories({ ...data, id: CategoriesEdit?.id as number }),
        onSuccess: () => {
            form.resetFields();
            setOpen(false);
            messageApi.success('Tạo mới thương hiệu thành công');
            queryClient.invalidateQueries({ queryKey: ["fetchAllCategories"] });
        },
        onError: () => {
            messageApi.error('An error has occurred');
        },
    })

    const handleSubmit = (fieldsValue: ICategoriesPayload) => {
        const dataForm: ICategoriesPayload = {
            ...fieldsValue,
            icon: logo as File,
        }
        if (isEdit) {
            editCategories.mutate({ ...dataForm, id: CategoriesEdit?.id as number });
            return;
        }
        createNewCategories.mutate(dataForm);
    };

    const handleCancel = () => {
        setOpen(false);
        form.resetFields();
        if (isEdit) {
            setIsEdit(false);
            setCategoriesEdit({} as ICategories);
        }
        setErrors({});
    }
    const handleFile = (file: any) => {
        setLogo(file.file);
    }

    useEffect(() => {
        if (isEdit) {
            form.setFieldsValue({
                category_name: CategoriesEdit?.category_name,
                category_description: CategoriesEdit?.category_description,
                parent_id: categoryParent?.data.filter((item: ICategories) => item.id === CategoriesEdit?.parent_id).reduce((acc: any, item: ICategories) => {
                    return { label: item.category_name, value: String(item.id) };
                }, {}),
                active: CategoriesEdit?.active ? '1' : '0',
                icon: [{ url: CategoriesEdit?.icon }],
            });
        }
    }, [isEdit, CategoriesEdit, form, categoryParent?.data]);

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }
        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
    };


    useEffect(() => {
        if (createNewCategories.isError) {
            setErrors(createNewCategories.error?.response?.data?.error);
        }
    }, [createNewCategories.isError, createNewCategories.error]);

    useEffect(() => {
        if (editCategories.isError) {
            setErrors(editCategories.error?.response?.data?.error);
        }
    }, [editCategories.isError, editCategories.error]);

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
                confirmLoading={createNewCategories.isPending}
            >
                <Form
                    layout="vertical"
                    style={{ maxWidth: 600 }}
                    onFinish={handleSubmit}
                    form={form}
                >
                    <Form.Item
                        label="Tên thể loại"
                        name="category_name"
                        validateStatus={errors?.category_name && 'error'}
                        help={errors?.category_name}
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên thể loại' },
                            { min: 2, message: 'Tên thể loại phải lớn hơn 2 ký tự' }
                        ]}
                    >
                        <Input />
                        {/* {createNewCategories.isError && createNewCategories.error?.response?.data?.message && <p style={{ color: 'red' }}>{createNewCategories.error?.response?.data?.error?.category_name}</p>} */}
                    </Form.Item>
                    <Form.Item
                        label="Mô tả"
                        name="category_description"
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
                        label="Thể loại cha"
                        name='parent_id'
                    >
                        <Select
                            notFoundContent={isError ? 'Có lỗi xảy ra' : null}
                            showSearch
                            placeholder="Select a person"
                            optionFilterProp="children"
                            filterOption={filterOption}
                            options={categoryParent?.data.map((item: ICategories) => ({ label: item.category_name, value: String(item.id) }))}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Trạng thái"
                        name='active'
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                        validateStatus={errors?.active && 'error'}
                        help={errors?.active}
                    >
                        <Select>
                            <Select.Option value="1">Kích hoạt</Select.Option>
                            <Select.Option value="0">Chưa kích hoạt</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Icon"
                        valuePropName="fileList"
                        name='icon'
                        getValueFromEvent={normFile}
                        labelCol={{ span: 4 }}
                        wrapperCol={{ span: 14 }}
                    >
                        <Upload
                            name="icon"
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
                </Form>
            </Modal >
            <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={() => setPreviewOpen(false)}>
                <img alt={previewTitle} style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </>
    );
};

export default CategoriesModal;

