import React from 'react';
import { Button, Flex, Form, Input, message } from 'antd';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { postLogin } from '@/redux/admin/auth.slice';
import { useNavigate } from 'react-router-dom';
import UnAuthorized from '@/pages/unAuthorized';
import FormItemLabel from 'antd/es/form/FormItemLabel';

type FieldType = {
    email: string;
    password: string;
};
const boxStyle: React.CSSProperties = {
    width: '100%',
    height: '100vh',
    backgroundColor: '#f0f2f5',
};
const Login: React.FC = () => {
    const dispath = useAppDispatch();
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const isLogin = useAppSelector(state => state.auth.isLoggedIn);
    const role = useAppSelector(state => state.auth.role);
    const loading = useAppSelector(state => state.auth.loading);
    const errorData = useAppSelector(state => state.auth.error);
    const messageData = useAppSelector(state => state.auth.message);
    const onFinish = (values: FieldType) => {
        dispath(postLogin({ email: values.email, password: values.password }));
    };

    
    if (isLogin && role === 'admin') {
        navigate('/admin')
        
    } else if (isLogin && role === 'user') {
        return <><UnAuthorized /></>
    }

    const error = (messageData: string) => {
        messageApi.open({
            type: 'error',
            content: messageData,
        });
    };
    const success = (messageData: string) => {
        messageApi.open({
            type: 'success',
            content: messageData,
        });
    };

    if (messageData) {
        if (errorData) {
            error(messageData);
        } else {
            success(messageData);
        }
    }

    return (
        <Flex style={boxStyle} justify={'center'} align={'center'}>
            {contextHolder}
            <Form
                name="login-form"
                style={{ width: 300 }}
                onFinish={onFinish}
                autoComplete="off"
            >
                <FormItemLabel
                    required={true}
                    label="Email"
                    htmlFor='login-form_email'
                />
                <Form.Item<FieldType>
                    name="email"
                    rules={[
                        { required: true, message: 'Please input your email!' },
                        { type: 'email', message: 'The input is not valid E-mail!' }
                    ]}
                >
                    <Input />
                </Form.Item>

                <FormItemLabel
                    required={true}
                    label="Password"
                    htmlFor='login-form_password'
                />
                <Form.Item<FieldType>
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item>
                    <Button
                        style={{ width: '100%' }}
                        type='primary'
                        htmlType='submit'
                        {...(loading ? { loading: true } : {})}
                    >
                        Login
                    </Button>
                </Form.Item>
            </Form>
        </Flex>
    );
};

export default Login;