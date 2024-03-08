import { useState } from 'react';
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
import { ICustomerModal, ICustomerPayload } from '@/interface/admin.customer';
import { createCustomer } from '@/services/admin/customer.service';
import type { GetProp, UploadFile, UploadProps } from 'antd';

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

const CustomerModal = (props: ICustomerModal) => {
    const { open, setOpen } = props;
    const [messageApi, contextHolder] = message.useMessage();
    const queryClient = useQueryClient();
    const [form] = Form.useForm();
    const [avatar, setAvatar] = useState<File>();
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const mutation = useMutation({
        mutationFn: async (data: ICustomerPayload) => await createCustomer(data),
        onSuccess: () => {
            form.resetFields();
            setOpen(false);
            messageApi.success('Tạo mới người dùng thành công');
            queryClient.invalidateQueries({ queryKey: ["fetchCustomer"] });
        },
        onError: () => {
            messageApi.error('An error has occurred');
        },
    })

    const handleSubmit = (fieldsValue: ICustomerPayload) => {
        const dataForm: ICustomerPayload = {
            ...fieldsValue,
            avatar,
        }
        mutation.mutate(dataForm);
    };

    const handleCancel = () => {
        setOpen(false);
        form.resetFields();
    }
    const handleFile = (file: any) => {
        console.log(file);
        setAvatar(file.file);
    }

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
                title='Tạo mới người dùng'
                onOk={form.submit}
                onCancel={handleCancel}
                okText='Lưu'
                cancelText='Hủy'
                confirmLoading={mutation.isPending}
            >
                <Form
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 14 }}
                    layout="horizontal"
                    style={{ maxWidth: 600 }}
                    onFinish={handleSubmit}
                    form={form}
                >
                    <Form.Item
                        label="Họ và tên"
                        name="name"
                        validateStatus={mutation.isError ? 'error' : 'success'}
                        rules={[
                            { required: true, message: 'Vui lòng nhập họ và tên' },
                            { min: 3, message: 'Họ và tên phải lớn hơn 3 ký tự' }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email' },
                            { type: 'email', message: 'Email không hợp lệ' }
                        ]}
                    >
                        <Input
                            type="email"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Mật khẩu"
                        name="password"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu' },
                            { min: 8, message: 'Email không hợp lệ' }
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        label="Quyền hạn"
                        name='role'
                        rules={[{ required: true, message: 'Vui lòng chọn quyền hạn' }]}
                    >
                        <Select >
                            <Select.Option value="user">User</Select.Option>
                            <Select.Option value="admin">Admin</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Trạng thái"
                        name='is_active'
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                    >
                        <Select >
                            <Select.Option value="1">Kích hoạt</Select.Option>
                            <Select.Option value="0">Chưa kích hoạt</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Avatar" valuePropName="fileList" name='avatar' getValueFromEvent={normFile}>
                        <Upload
                            name="avatar"
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
                    {mutation.isError && <p style={{ color: 'red' }}>Có lỗi xảy ra</p>}
                </Form>
            </Modal >
            <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={() => setPreviewOpen(false)}>
                <img alt={previewTitle} style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </>
    );
};

export default CustomerModal;

