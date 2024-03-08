import React from 'react';
import { Button, Result } from 'antd';

const UnAuthorized: React.FC = () => {
    const backHome = () => {
        window.location.href = '/';
    }

    return (
        <Result
            status="403"
            title="403"
            subTitle="Sorry, you are not authorized to access this page."
            extra={<Button type="primary" onClick={backHome}>Back Home</Button>}
        />
    );
}
export default UnAuthorized;