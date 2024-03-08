import React from 'react';
import { Button, Result } from 'antd';

const ServerError: React.FC = () => {
    const backHome = () => {
        window.location.href = '/';
    };
    return (
        <Result
            status="500"
            title="500"
            subTitle="Sorry, something went wrong."
            extra={<Button type="primary" onClick={backHome}>Back Home</Button>}
        />
    );
}
export default ServerError;